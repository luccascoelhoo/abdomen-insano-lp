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

import { lerCookiesDoPixel, lerUtm } from '@/lib/utm';

export const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? '894388872511780';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * Id único por acontecimento. Client e servidor precisam mandar o MESMO id
 * para o mesmo fato, senão o Meta conta duas vezes e o custo por resultado
 * aparece pela metade do real.
 */
export function novoEventId(): string {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  } catch {
    /* ambiente sem crypto — cai no fallback abaixo */
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Manda o mesmo evento pelo servidor, com o mesmo `event_id`.
 *
 * O disparo do navegador morre em bloqueador de anúncio e em modo restrito de
 * iOS, e a fatia perdida não aparece em lugar nenhum — o painel mostra menos
 * evento e ninguém sabe se foi queda de tráfego ou de medição. A segunda perna
 * fecha esse buraco, e o `event_id` compartilhado impede que ela vire contagem
 * dobrada.
 *
 * O que identifica a pessoa são os cookies do próprio pixel. Eles nascem logo
 * depois do `init`, então o primeiro `PageView` pode chegar aqui antes deles:
 * daí a única retentativa, curta, antes de desistir em silêncio.
 */
function espelharNoServidor(evento: string, eventId: string, tentativa = 0): void {
  if (typeof window === 'undefined') return;

  const { fbp, fbc } = lerCookiesDoPixel();
  if (!fbp && !fbc) {
    if (tentativa === 0) {
      window.setTimeout(() => espelharNoServidor(evento, eventId, 1), 1500);
    }
    return;
  }

  try {
    void fetch('/api/evento', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        evento,
        eventId,
        caminho: window.location.pathname,
        fbp,
        fbc,
        fbclid: lerUtm().fbclid,
      }),
    }).catch(() => {
      /* a perna do navegador já saiu; a do servidor é redundância */
    });
  } catch {
    /* idem */
  }
}

/**
 * Quais eventos ganham a segunda perna.
 *
 * `PageView` fica de fora de propósito: é o evento que menos pesa na
 * otimização e o mais frequente de todos, então espelhá-lo dobraria a
 * invocação de função por visita em troca de quase nada. Quem decide verba é
 * `ViewContent` e `InitiateCheckout`, e o `Purchase` já nasce no servidor.
 */
const ESPELHADOS = new Set(['ViewContent', 'InitiateCheckout']);

/** Dispara um evento padrão e devolve o `event_id` usado. */
export function rastrear(evento: string, parametros: Record<string, unknown> = {}): string {
  const eventId = novoEventId();
  if (typeof window === 'undefined') return eventId;
  window.fbq?.('track', evento, parametros, { eventID: eventId });
  if (ESPELHADOS.has(evento)) espelharNoServidor(evento, eventId);
  return eventId;
}
