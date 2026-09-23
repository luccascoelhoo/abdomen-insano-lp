import { NextResponse } from 'next/server';
import { capiConfigurado, enviarEventoCapi, fbcDeFbclid } from '@/lib/meta-capi';
import { oferta } from '@/content/desafio';
import { registrarEnvioCapi } from '@/lib/compra';
import { produtoPorId } from '@/lib/produtos';
import { supabaseConfigured } from '@/lib/supabase';

/**
 * A segunda perna dos eventos que nascem no navegador.
 *
 * `ViewContent` e `InitiateCheckout` saem do `fbq` e morrem ali:
 * bloqueador de anúncio, modo restrito do iOS e extensão de privacidade
 * derrubam uma fatia que ninguém consegue medir depois. O `Purchase` já tinha
 * as duas pernas porque nasce no webhook; estes não tinham nenhuma.
 *
 * Aqui o mesmo evento é reenviado pelo servidor com o **mesmo `event_id`** que
 * o navegador usou. O Meta recebe os dois, reconhece o par e conta um só. Onde
 * o navegador foi bloqueado, chega só o do servidor, e o evento existe.
 *
 * Por que isto não vira porta aberta para inflar o pixel de fora:
 *
 *  - só os dois eventos da lista passam, nada mais;
 *  - o valor **nunca** vem do corpo da requisição, vem do preço que o servidor
 *    conhece — a oferta do front, ou o degrau do funil que o `produtoId`
 *    aponta no catálogo — então ninguém injeta receita inventada;
 *  - `produtoId` só é aceito se existir em `lib/produtos.ts`; id desconhecido
 *    é recusado em vez de virar venda do front;
 *  - `Origin` e `Referer` precisam ser do próprio site;
 *  - o `event_source_url` é reconstruído aqui, não aceito de fora.
 *
 * Nenhum dado pessoal trafega: o que identifica é o par de cookies do próprio
 * pixel (`_fbp`, `_fbc`), que o navegador manda junto.
 */
export const runtime = 'nodejs';

/**
 * `PageView` não entra: é o mais frequente e o que menos pesa na otimização,
 * então espelhá-lo dobraria a invocação de função por visita em troca de quase
 * nada. A lista do cliente, em `lib/pixel.ts`, é a mesma.
 */
const EVENTOS_PERMITIDOS = new Set(['ViewContent', 'InitiateCheckout']);

type Corpo = {
  evento?: string;
  eventId?: string;
  /** Degrau do funil (`lib/produtos.ts`). Ausente = front, que é o que a LP vende. */
  produtoId?: string;
  caminho?: string;
  fbp?: string;
  fbc?: string;
  fbclid?: string;
};

/** Aceita apenas requisição vinda de uma página deste mesmo site. */
function daCasa(request: Request): boolean {
  const permitido = (valor: string | null) => {
    if (!valor) return false;
    try {
      const host = new URL(valor).host;
      // `endsWith` puro deixava passar `xabdomeninsano.com.br`, que é outro
      // dono. O domínio tem que ser ele mesmo ou um subdomínio dele.
      return (
        host === 'abdomeninsano.com.br' ||
        host === 'www.abdomeninsano.com.br' ||
        host.endsWith('.abdomeninsano.com.br') ||
        host === 'localhost' ||
        host.startsWith('localhost:')
      );
    } catch {
      return false;
    }
  };
  return permitido(request.headers.get('origin')) || permitido(request.headers.get('referer'));
}

export async function POST(request: Request) {
  if (!daCasa(request)) {
    return NextResponse.json({ ok: false, motivo: 'origem_invalida' }, { status: 403 });
  }
  if (!capiConfigurado()) {
    // Sem token não há o que fazer, e não é erro do navegador: ele já mediu o
    // lado dele. Responde 200 dizendo que a segunda perna não saiu.
    return NextResponse.json({ ok: true, medicao: 'capi_sem_token' });
  }

  let corpo: Corpo;
  try {
    corpo = (await request.json()) as Corpo;
  } catch {
    return NextResponse.json({ ok: false, motivo: 'json_invalido' }, { status: 400 });
  }

  const evento = (corpo.evento ?? '').trim();
  const eventId = (corpo.eventId ?? '').trim();
  if (!EVENTOS_PERMITIDOS.has(evento) || !eventId || eventId.length > 100) {
    return NextResponse.json({ ok: false, motivo: 'evento_invalido' }, { status: 400 });
  }

  // Qual degrau este evento mede. Sem id, é o front da LP — o comportamento de
  // sempre. Com id, tem que ser um do catálogo: o valor e o nome saem de lá,
  // nunca do corpo, e id desconhecido para aqui em vez de contaminar o front.
  // `!== undefined` e não truthy: string vazia é chamador com bug, não
  // ausência. Deixar `''` cair no front mediria R$ 42 no lugar do degrau sem
  // erro nenhum, que é o tipo de silêncio que esta rota existe para evitar.
  const produtoId = corpo.produtoId === undefined ? undefined : String(corpo.produtoId).trim();
  const produto = produtoId ? produtoPorId(produtoId) : undefined;
  if (produtoId !== undefined && !produto) {
    return NextResponse.json({ ok: false, motivo: 'produto_invalido' }, { status: 400 });
  }

  const fbp = corpo.fbp?.trim();
  const fbc = corpo.fbc?.trim() || fbcDeFbclid(corpo.fbclid?.trim());
  if (!fbp && !fbc) {
    // Sem cookie do pixel não há quem identificar, e evento sem identificador
    // é recusado pelo Meta. Não é falha: só não há segunda perna desta visita.
    return NextResponse.json({ ok: true, medicao: 'sem_identificador' });
  }

  const caminho = (corpo.caminho ?? '/').startsWith('/') ? corpo.caminho! : '/';
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.abdomeninsano.com.br';

  const r = await enviarEventoCapi({
    evento,
    eventId,
    fbp,
    fbc,
    valor: produto ? produto.centavos / 100 : oferta.precoNumero,
    moeda: oferta.precoMoeda,
    urlOrigem: `${base}${caminho}`,
    conteudo: produto
      ? { id: produto.id, nome: produto.nome }
      : { id: 'dai-front', nome: 'Desafio Abdômen Insano' },
  });

  const medicao = r.ok ? `enviado:${r.eventos}` : `falhou:${r.motivo}`;
  if (!r.ok) {
    console.error('[api/evento] evento não chegou ao Meta', {
      evento,
      eventId,
      motivo: r.motivo,
      detalhe: r.detalhe,
    });
  }

  // Uma linha por envio, para a dedup ser conferível fora do painel do Meta.
  // Tolerante: sem banco, ou sem a tabela, fica no log e a resposta é a mesma.
  if (supabaseConfigured()) {
    await registrarEnvioCapi({ evento, event_id: eventId, resultado: medicao, caminho });
  }

  return NextResponse.json({ ok: true, medicao });
}
