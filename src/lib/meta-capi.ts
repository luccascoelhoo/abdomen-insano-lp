import crypto from 'node:crypto';
import { PIXEL_ID } from '@/lib/pixel';

/**
 * Conversions API do Meta — o lado servidor da medição.
 *
 * Por que existe: o `Purchase` não pode nascer no navegador. Quem fecha a aba
 * depois de pagar nunca dispara o evento, quem recarrega dispara duas vezes, e
 * bloqueador de anúncio derruba o pixel inteiro. O webhook do gateway é a única
 * fonte que sabe que o dinheiro entrou.
 *
 * Deduplicação: o `event_id` daqui é determinístico, derivado da transação
 * (`cakto:<id>`). A página de obrigado dispara o MESMO id no navegador. O Meta
 * recebe os dois, reconhece o par e conta uma venda só. Se os ids divergirem, o
 * custo por resultado aparece pela metade do real.
 *
 * Nada aqui falha em silêncio: sem token configurado a função devolve o motivo,
 * e quem chama registra. Evento de dinheiro que some sem aviso é o pior defeito
 * possível numa operação paga.
 */

const API_VERSION = 'v21.0';

export type ResultadoCapi =
  | { ok: true; eventos: number }
  | { ok: false; motivo: string; detalhe?: string };

/** SHA-256 em minúsculas, que é o formato exigido para todo dado pessoal. */
function hash(valor: string | undefined | null): string | undefined {
  const limpo = (valor ?? '').trim().toLowerCase();
  if (!limpo) return undefined;
  return crypto.createHash('sha256').update(limpo).digest('hex');
}

/** Só dígitos, com DDI do Brasil quando o número vem sem ele. */
function telefoneNormalizado(bruto: string | undefined): string | undefined {
  const digitos = (bruto ?? '').replace(/\D/g, '');
  if (digitos.length < 10) return undefined;
  return digitos.startsWith('55') ? digitos : `55${digitos}`;
}

export type EventoCapi = {
  /** Nome do evento padrão, por exemplo `Purchase`. */
  evento: string;
  /** Id determinístico compartilhado com o disparo do navegador. */
  eventId: string;
  /** Segundos desde a época. O Meta recusa evento com mais de 7 dias. */
  quandoSegundos?: number;
  email?: string;
  telefone?: string;
  nome?: string;
  /** Cookie `_fbp` do navegador, quando o gateway repassa. */
  fbp?: string;
  /** Cookie `_fbc`, ou `fb.1.<ts>.<fbclid>` remontado a partir do fbclid. */
  fbc?: string;
  valor?: number;
  moeda?: string;
  /** URL de onde a jornada partiu; ajuda o Meta a casar com o evento do browser. */
  urlOrigem?: string;
  conteudo?: { id: string; nome: string };
};

export function capiConfigurado(): boolean {
  return Boolean(process.env.META_CAPI_TOKEN);
}

/**
 * Remonta o `_fbc` a partir de um `fbclid` solto, que é o que sobra quando o
 * gateway repassa a query string mas não os cookies.
 */
export function fbcDeFbclid(fbclid: string | undefined, quandoMs = Date.now()): string | undefined {
  if (!fbclid) return undefined;
  return `fb.1.${quandoMs}.${fbclid}`;
}

export async function enviarEventoCapi(e: EventoCapi): Promise<ResultadoCapi> {
  const token = process.env.META_CAPI_TOKEN;
  if (!token) return { ok: false, motivo: 'token_ausente' };

  const userData: Record<string, unknown> = {};
  const em = hash(e.email);
  if (em) userData.em = [em];
  const ph = hash(telefoneNormalizado(e.telefone));
  if (ph) userData.ph = [ph];
  const fn = hash(e.nome?.split(' ')[0]);
  if (fn) userData.fn = [fn];
  if (e.fbp) userData.fbp = e.fbp;
  if (e.fbc) userData.fbc = e.fbc;

  if (Object.keys(userData).length === 0) {
    return { ok: false, motivo: 'sem_identificador' };
  }

  const corpo = {
    data: [
      {
        event_name: e.evento,
        event_time: e.quandoSegundos ?? Math.floor(Date.now() / 1000),
        event_id: e.eventId,
        action_source: 'website',
        event_source_url: e.urlOrigem,
        user_data: userData,
        custom_data: {
          ...(e.valor !== undefined ? { value: e.valor } : {}),
          currency: e.moeda ?? 'BRL',
          ...(e.conteudo
            ? {
                content_ids: [e.conteudo.id],
                content_name: e.conteudo.nome,
                content_type: 'product',
              }
            : {}),
        },
      },
    ],
    ...(process.env.META_TEST_EVENT_CODE
      ? { test_event_code: process.env.META_TEST_EVENT_CODE }
      : {}),
  };

  let resposta: Response;
  try {
    resposta = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${encodeURIComponent(token)}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(corpo),
      },
    );
  } catch (erro) {
    return { ok: false, motivo: 'falha_rede', detalhe: String(erro) };
  }

  const texto = await resposta.text();
  if (!resposta.ok) {
    return { ok: false, motivo: `http_${resposta.status}`, detalhe: texto.slice(0, 400) };
  }

  let recebidos = 0;
  try {
    recebidos = (JSON.parse(texto) as { events_received?: number }).events_received ?? 0;
  } catch {
    /* corpo fora do formato esperado; o status já disse que passou */
  }
  return { ok: true, eventos: recebidos };
}
