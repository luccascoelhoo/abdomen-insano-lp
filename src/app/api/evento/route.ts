import { NextResponse } from 'next/server';
import { capiConfigurado, enviarEventoCapi, fbcDeFbclid } from '@/lib/meta-capi';
import { oferta } from '@/content/desafio';

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
 *  - o valor **nunca** vem do corpo da requisição, vem do preço da oferta no
 *    servidor, então ninguém injeta receita inventada;
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
      return host.endsWith('abdomeninsano.com.br') || host.startsWith('localhost');
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
    valor: oferta.precoNumero,
    moeda: oferta.precoMoeda,
    urlOrigem: `${base}${caminho}`,
    conteudo: { id: 'dai-front', nome: 'Desafio Abdômen Insano' },
  });

  if (!r.ok) {
    console.error('[api/evento] evento não chegou ao Meta', {
      evento,
      eventId,
      motivo: r.motivo,
      detalhe: r.detalhe,
    });
    return NextResponse.json({ ok: true, medicao: `falhou:${r.motivo}` });
  }

  return NextResponse.json({ ok: true, medicao: `enviado:${r.eventos}` });
}
