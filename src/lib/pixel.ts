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

import type { MouseEvent } from 'react';
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
 * O que identifica a pessoa são os cookies do próprio pixel, ou o `fbclid` do
 * anúncio, que o servidor transforma em `fbc`. Os cookies nascem logo depois
 * do `init`, então o primeiro evento pode chegar aqui antes deles: daí a única
 * retentativa, curta, antes de desistir em silêncio.
 *
 * `InitiateCheckout` não espera. Ele nasce num clique que tira a pessoa da
 * página, e uma retentativa de 1,5 s depois da saída nunca acontece.
 */
function espelharNoServidor(
  evento: string,
  eventId: string,
  produtoId: string | undefined,
  tentativa = 0,
): void {
  if (typeof window === 'undefined') return;

  const { fbp, fbc } = lerCookiesDoPixel();
  const fbclid = lerUtm().fbclid;
  if (!fbp && !fbc && !fbclid) {
    if (tentativa === 0 && evento !== 'InitiateCheckout') {
      window.setTimeout(() => espelharNoServidor(evento, eventId, produtoId, 1), 1500);
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
        // Qual degrau do funil vendeu. O servidor NÃO aceita valor daqui: ele
        // lê o preço do catálogo por este id, então o campo não abre porta
        // para inflar receita de fora.
        produtoId,
        caminho: window.location.pathname,
        fbp,
        fbc,
        fbclid,
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

/**
 * Dispara um evento padrão e devolve o `event_id` usado.
 *
 * `produtoId` é o degrau do funil (`lib/produtos.ts`). A LP vende o front e
 * pode omitir; as páginas de upsell e downsell precisam informar, senão o
 * evento chega ao Meta com o produto errado e a conversão personalizada do
 * front passa a contar venda que não é dela.
 */
export function rastrear(
  evento: string,
  parametros: Record<string, unknown> = {},
  produtoId?: string,
): string {
  const eventId = novoEventId();
  if (typeof window === 'undefined') return eventId;
  // `trackSingle`, e não `track`: `track` dispara em todo pixel carregado na
  // página, e o container do cliente tem seis tags pausadas apontando para o
  // pixel de outro produto. Se alguém despausar uma, `track` mandaria cada
  // evento daqui para lá também.
  window.fbq?.('trackSingle', PIXEL_ID, evento, parametros, { eventID: eventId });
  if (ESPELHADOS.has(evento)) espelharNoServidor(evento, eventId, produtoId);
  return eventId;
}

/**
 * Quanto o clique de compra segura a saída para o pixel do navegador partir.
 * A cópia do servidor já sai com `keepalive` e não depende disto.
 */
const ESPERA_ANTES_DE_SAIR_MS = 150;

/**
 * Segura a navegação de um link de checkout por um instante.
 *
 * Sem isto, o `InitiateCheckout` do navegador é chamado e a troca de página
 * cancela o envio: a auditoria de 28/09/2026 viu o evento sair só pelo
 * servidor. Abrir em outra aba (Ctrl, Cmd, Shift, botão do meio) não troca a
 * página atual, então segue o comportamento normal do navegador.
 */
export function seguirAposMedir(evento: MouseEvent<HTMLAnchorElement>): void {
  if (typeof window === 'undefined') return;
  const link = evento.currentTarget;
  if (
    evento.defaultPrevented ||
    evento.button !== 0 ||
    evento.metaKey ||
    evento.ctrlKey ||
    evento.shiftKey ||
    evento.altKey ||
    (link.target && link.target !== '_self')
  ) {
    return;
  }
  const destino = link.href;
  evento.preventDefault();
  link.dataset.saindo = '1';
  window.setTimeout(() => window.location.assign(destino), ESPERA_ANTES_DE_SAIR_MS);
  // Navegação interrompida (Esc, aba que não descarrega) não dispara
  // `pageshow`: sem este prazo o botão de compra ficaria morto até recarregar.
  window.setTimeout(() => {
    delete link.dataset.saindo;
  }, 3000);
}

/**
 * Este link já está saindo? A espera de {@link seguirAposMedir} deixa a página
 * viva o bastante para um segundo toque, que mediria outro checkout com outro
 * `event_id`. Quem volta pelo botão "voltar" do navegador encontra a página do
 * cache, com a marca ainda posta: `pageshow` a apaga.
 */
export function jaEstaSaindo(evento: MouseEvent<HTMLAnchorElement>): boolean {
  if (evento.currentTarget.dataset.saindo !== '1') return false;
  evento.preventDefault();
  return true;
}

if (typeof window !== 'undefined') {
  window.addEventListener('pageshow', () => {
    document.querySelectorAll<HTMLElement>('[data-saindo]').forEach((el) => {
      delete el.dataset.saindo;
    });
  });
}
