/**
 * Meta Pixel — carga e disparo.
 *
 * O pixel é COMPARTILHADO com outro funil do mesmo dono (`operacao3em10.com.br`
 * grava no mesmo id). Por isso a campanha desta página nunca deve otimizar por
 * evento padrão: a otimização mora em conversão personalizada filtrada por
 * `url contains abdomeninsano.com.br`, criada na conta de anúncio. Sem esse
 * filtro, o algoritmo aprende com comprador de outro produto.
 *
 * O id vem de env quando existir, e cai no id real decidido em 15/09/2026.
 * Nunca colocar id de exemplo aqui: campo que funciona sem ser trocado passa
 * por instalado e não grava.
 */

export const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? '894388872511780';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * Id único por acontecimento. Client e servidor precisam mandar o MESMO id
 * para o mesmo fato, senão o Meta conta duas vezes e o custo por resultado
 * aparece pela metade do real. Enquanto a Conversions API não existe, o id já
 * viaja — é uma linha agora e é remedição inteira depois.
 */
export function novoEventId(): string {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  } catch {
    /* ambiente sem crypto — cai no fallback abaixo */
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Dispara um evento padrão e devolve o `event_id` usado. */
export function rastrear(evento: string, parametros: Record<string, unknown> = {}): string {
  const eventId = novoEventId();
  if (typeof window === 'undefined') return eventId;
  window.fbq?.('track', evento, parametros, { eventID: eventId });
  return eventId;
}
