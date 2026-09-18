import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { registrarOuAtualizarCompra, type StatusCompra } from '@/lib/compra';
import { capiConfigurado, enviarEventoCapi, fbcDeFbclid } from '@/lib/meta-capi';
import { PIXEL_ID } from '@/lib/pixel';
import { classificarPorValor } from '@/lib/produtos';
import { eventIdDaTransacao, idDaTransacao } from '@/lib/transacao';
import { supabaseConfigured } from '@/lib/supabase';

/**
 * Webhook do Cakto (postback).
 *
 * Configuração no painel Cakto → Integrações → Webhook:
 *   URL:  https://SEU_DOMINIO/api/webhook/cakto
 *   Método: POST
 *   Segredo: valor de CAKTO_WEBHOOK_SECRET (variável de ambiente)
 *
 * O Cakto envia o segredo no header `X-Cakto-Signature` (ou `Authorization`,
 * dependendo da versão). A rota rejeita 401 se não bater — nunca grava compra
 * de origem desconhecida.
 *
 * O corpo esperado é o postback padrão. Como o formato exato pode mudar entre
 * versões, o parser é defensivo: aceita várias formas do mesmo campo.
 *
 * Duas coisas acontecem aqui, nesta ordem, e a primeira não depende da segunda:
 *   1. o `Purchase` sai para o Meta pela Conversions API;
 *   2. a compra é gravada no banco, que é o registro da casa.
 *
 * A ordem já foi a inversa e estava errada. Gravar antes fazia a medição
 * refém do banco: com o Supabase fora do ar, ou só sem variável configurada,
 * a rota devolvia 500 antes de chegar ao Meta e **nenhuma venda era medida**,
 * em toda tentativa e em toda reentrega. Campanha que não vê venda otimiza no
 * escuro, e isso custa verba por dia.
 *
 * Se a gravação falhar agora, a resposta continua sendo 500 de propósito, para
 * a Cakto reenviar e o registro não se perder. O `Purchase` sai de novo na
 * reentrega, com o mesmo `event_id` determinístico, e o Meta deduplica. Ou
 * seja: nenhuma das duas pontas é sacrificada pela outra.
 */
export const runtime = 'nodejs';

type PayloadCakto = {
  event?: string;
  status?: string;
  transaction?: { id?: string; status?: string; amount?: number };
  data?: {
    id?: string;
    status?: string;
    amount?: number;
    customer?: { email?: string; name?: string; phone?: string };
    utm?: Record<string, string>;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
    sck?: string | null;
    fbc?: string | null;
    fbp?: string | null;
  };
  customer?: { email?: string; name?: string; phone?: string };
  email?: string;
  amount?: number;
  id?: string;
  utm?: Record<string, string>;
  /** O Cakto manda o segredo do webhook AQUI, no corpo — não em header. */
  secret?: string;
};

function mapearStatus(bruto: string | undefined): StatusCompra {
  const s = (bruto ?? '').toLowerCase();
  if (['paid', 'approved', 'aprovado', 'aprovada', 'completed', 'success'].includes(s))
    return 'aprovada';
  if (['refunded', 'estornado', 'refund'].includes(s)) return 'estornada';
  if (['chargeback', 'contestado'].includes(s)) return 'chargeback';
  return 'pendente';
}

function centavos(valor: number | undefined): number {
  if (typeof valor !== 'number' || Number.isNaN(valor)) return 0;
  return valor < 1000 ? Math.round(valor * 100) : Math.round(valor);
}

/** O segredo pode chegar em três cabeçalhos diferentes, conforme a versão da Cakto. */
function assinaturaDe(request: Request): string {
  return (
    request.headers.get('x-cakto-signature') ??
    request.headers.get('x-webhook-secret') ??
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ??
    ''
  );
}

/**
 * Impressão digital de um segredo: os 12 primeiros hex do SHA-256.
 *
 * Serve para responder "o valor que está aqui é o mesmo que eu tenho na mão?"
 * sem devolver o valor. Comparar impressões prova identidade; a impressão
 * sozinha não reconstrói nada.
 */
function impressao(valor: string | undefined | null): string | null {
  if (!valor) return null;
  return createHash('sha256').update(valor).digest('hex').slice(0, 12);
}

/**
 * Diagnóstico do deploy, atrás do mesmo segredo do webhook.
 *
 * Existe porque a configuração deste projeto mora numa conta Vercel que não é
 * nossa. Sem isto, saber se uma variável de ambiente entrou dependia de
 * esperar uma venda real acontecer, e saber qual build está no ar dependia de
 * acreditar em quem publicou. As duas perguntas passam a ter resposta lida,
 * a qualquer hora, por quem tem o segredo.
 *
 * Nunca devolve valor de segredo: só presença e impressão digital.
 */
export async function GET(request: Request) {
  const segredo = process.env.CAKTO_WEBHOOK_SECRET;
  if (!segredo) {
    return NextResponse.json({ ok: false, motivo: 'nao_configurado' }, { status: 503 });
  }
  if (assinaturaDe(request) !== segredo) {
    return NextResponse.json({ ok: false, motivo: 'assinatura_invalida' }, { status: 401 });
  }

  let supabaseHost: string | null = null;
  try {
    supabaseHost = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').host;
  } catch {
    supabaseHost = null;
  }

  return NextResponse.json({
    ok: true,
    deploy: {
      ambiente: process.env.VERCEL_ENV ?? null,
      commit: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
      branch: process.env.VERCEL_GIT_COMMIT_REF ?? null,
      regiao: process.env.VERCEL_REGION ?? null,
    },
    variaveis: {
      CAKTO_WEBHOOK_SECRET: impressao(segredo),
      META_CAPI_TOKEN: impressao(process.env.META_CAPI_TOKEN),
      META_TEST_EVENT_CODE: Boolean(process.env.META_TEST_EVENT_CODE),
      NEXT_PUBLIC_META_PIXEL_ID: PIXEL_ID,
      NEXT_PUBLIC_SUPABASE_URL: supabaseHost,
      SUPABASE_SERVICE_ROLE_KEY: impressao(process.env.SUPABASE_SERVICE_ROLE_KEY),
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? null,
    },
    pronto: {
      webhook: true,
      purchase_server_side: capiConfigurado(),
      persistencia: supabaseConfigured(),
    },
  });
}

export async function POST(request: Request) {
  const segredo = process.env.CAKTO_WEBHOOK_SECRET;
  if (!segredo) {
    console.error('[webhook/cakto] CAKTO_WEBHOOK_SECRET não configurado');
    return NextResponse.json({ ok: false, motivo: 'nao_configurado' }, { status: 503 });
  }


  let payload: PayloadCakto;
  try {
    payload = (await request.json()) as PayloadCakto;
  } catch {
    return NextResponse.json({ ok: false, motivo: 'json_invalido' }, { status: 400 });
  }

  // ⚠️ O CAKTO MANDA O SEGREDO NO CORPO, NÃO EM HEADER — medido em 18/09/2026
  // no histórico de entregas do próprio Cakto (evento de teste para este
  // webhook): o payload chega como { data, event, secret } e sem nenhum
  // header de assinatura. Comparar só headers dava 401 em TODO evento real.
  // Headers continuam aceitos como fallback. Comparação em tempo constante.
  const recebido = payload.secret ?? assinaturaDe(request);
  if (!segredoConfere(recebido, segredo)) {
    return NextResponse.json({ ok: false, motivo: 'assinatura_invalida' }, { status: 401 });
  }

  const cliente = payload.data?.customer ?? payload.customer;
  const email = cliente?.email ?? payload.email ?? '';
  // Varre todos os nomes que o gateway pode usar, na mesma ordem de preferência
  // que a página de obrigado usa. Os dois lados escolhendo igual é o que faz a
  // deduplicação funcionar sem depender de o gateway ser coerente consigo mesmo.
  const transacao_id =
    idDaTransacao(payload.data as Record<string, unknown>) ??
    idDaTransacao(payload.transaction as Record<string, unknown>) ??
    idDaTransacao(payload as Record<string, unknown>) ??
    '';
  const status = mapearStatus(
    payload.data?.status ?? payload.transaction?.status ?? payload.status ?? payload.event,
  );
  const valor_centavos = centavos(
    payload.data?.amount ?? payload.transaction?.amount ?? payload.amount,
  );
  // O Cakto manda os UTMs PLANOS em data (utm_source, utm_medium, …, sck) e
  // fbc/fbp também em data — não existe data.utm. Sem isto, utm era sempre nulo.
  const utm =
    payload.data?.utm ??
    payload.utm ??
    utmDosCamposPlanos(payload.data) ??
    null;

  if (!email || !transacao_id) {
    return NextResponse.json(
      { ok: false, motivo: 'campos_obrigatorios_ausentes' },
      { status: 400 },
    );
  }

  // Só venda aprovada vira Purchase. Pendente e estorno ficam no banco e não
  // sobem: evento de dinheiro que não entrou infla o resultado da campanha.
  let medicao: string = 'nao_aplicavel';
  if (status === 'aprovada') {
    if (!capiConfigurado()) {
      medicao = 'capi_sem_token';
      console.error('[webhook/cakto] venda aprovada sem META_CAPI_TOKEN — Purchase não medido', {
        transacao_id,
      });
    } else {
      const produto = classificarPorValor(valor_centavos);
      const r = await enviarEventoCapi({
        evento: 'Purchase',
        eventId: eventIdDaTransacao(transacao_id),
        email,
        telefone: cliente?.phone,
        nome: cliente?.name,
        // O gateway não repassa cookie; o que sobra é o fbclid que a landing
        // anexou ao checkout e voltou dentro do bloco de UTM.
        fbp: utm?.fbp,
        fbc: utm?.fbc ?? fbcDeFbclid(utm?.fbclid),
        valor: valor_centavos / 100,
        moeda: 'BRL',
        // A landing é a origem da jornada. Se o gateway devolver a URL real de
        // onde a venda partiu, ela manda: gravar sempre a home é uma meia
        // verdade que atrapalha quando existir mais de uma página de entrada.
        urlOrigem:
          utm?.url_origem ??
          process.env.NEXT_PUBLIC_SITE_URL ??
          'https://www.abdomeninsano.com.br/',
        conteudo: { id: produto.id, nome: produto.nome },
      });
      medicao = r.ok ? `enviado:${r.eventos}` : `falhou:${r.motivo}`;
      if (!r.ok) {
        console.error('[webhook/cakto] Purchase não chegou ao Meta', {
          transacao_id,
          motivo: r.motivo,
          detalhe: r.detalhe,
        });
      }
    }
  }

  try {
    await registrarOuAtualizarCompra({
      email,
      gateway: 'cakto',
      transacao_id,
      status,
      valor_centavos,
      utm,
    });
  } catch (erro) {
    console.error('[webhook/cakto] falha ao gravar compra', { transacao_id, medicao, erro });
    return NextResponse.json(
      { ok: false, motivo: 'erro_persistencia', medicao },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, medicao });
}

/** Compara em tempo constante (evita medir o segredo pelo tempo de resposta). */
function segredoConfere(recebido: string, esperado: string): boolean {
  if (!recebido || recebido.length !== esperado.length) return false;
  let diff = 0;
  for (let i = 0; i < esperado.length; i++) {
    diff |= recebido.charCodeAt(i) ^ esperado.charCodeAt(i);
  }
  return diff === 0;
}

/** Monta `utm` a partir dos campos planos que o Cakto envia em `data`. */
function utmDosCamposPlanos(
  data: PayloadCakto['data'] | undefined,
): Record<string, string> | null {
  if (!data) return null;
  const pares: Array<[string, string | null | undefined]> = [
    ['utm_source', data.utm_source],
    ['utm_medium', data.utm_medium],
    ['utm_campaign', data.utm_campaign],
    ['utm_term', data.utm_term],
    ['utm_content', data.utm_content],
    ['sck', data.sck],
    ['fbc', data.fbc],
    ['fbp', data.fbp],
  ];
  const utm: Record<string, string> = {};
  for (const [k, v] of pares) if (typeof v === 'string' && v) utm[k] = v;
  return Object.keys(utm).length ? utm : null;
}
