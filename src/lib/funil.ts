import { downsell, upsell, type PaginaFunil } from '@/content/desafio';

/**
 * Ordem do funil pós-compra — o único lugar que decide "pra onde vai agora".
 *
 *   compra do Desafio → /shapeinsano-up ─ sim → checkout do upsell → /obrigado
 *                                       └ não → /shapeinsano-down ─ sim → checkout → /obrigado
 *                                                                 └ não → /obrigado
 *
 * Uma página só entra no caminho quando está pronta (VSL + link do "sim").
 * Sem isso ela é pulada: melhor ir direto pro /obrigado do que mostrar um
 * vídeo vazio pra quem acabou de pagar. O downsell só é alcançado a partir do
 * upsell, nunca direto depois da compra.
 */
export const ROTA_UPSELL = '/shapeinsano-up';
export const ROTA_DOWNSELL = '/shapeinsano-down';
export const ROTA_OBRIGADO = '/obrigado';

export function paginaPronta(pagina: PaginaFunil): boolean {
  return Boolean(pagina.vsl.playerId && pagina.vsl.scriptUrl && pagina.aceitar.url);
}

/**
 * Pra onde o checkout do Desafio devolve o comprador.
 *
 * Só o upsell abre o funil. O downsell NÃO é porta de entrada: ele é a segunda
 * chance de quem recusou o upsell ("aumentei o seu desconto" só faz sentido
 * depois de um desconto menor). Sem o upsell pronto, o comprador vai direto
 * pro /obrigado — mesmo que o downsell já esteja pronto.
 */
export function destinoPosCompra(): string {
  return paginaPronta(upsell) ? ROTA_UPSELL : ROTA_OBRIGADO;
}

/** Pra onde vai quem aceita uma oferta do funil (upsell ou downsell): criar a conta. */
export function destinoAceite(): string {
  return ROTA_OBRIGADO;
}

/** Pra onde vai quem clica "não" no upsell. */
export function destinoRecusaUpsell(): string {
  return paginaPronta(downsell) ? ROTA_DOWNSELL : ROTA_OBRIGADO;
}

/** Quem recusa o downsell já é aluno do Desafio: vai criar a conta. */
export function destinoRecusaDownsell(): string {
  return ROTA_OBRIGADO;
}
