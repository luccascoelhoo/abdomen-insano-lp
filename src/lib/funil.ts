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
 * vídeo vazio pra quem acabou de pagar.
 */
export const ROTA_UPSELL = '/shapeinsano-up';
export const ROTA_DOWNSELL = '/shapeinsano-down';
export const ROTA_OBRIGADO = '/obrigado';

export function paginaPronta(pagina: PaginaFunil): boolean {
  return Boolean(pagina.vsl.playerId && pagina.vsl.scriptUrl && pagina.aceitar.url);
}

/** Pra onde o checkout do Desafio devolve o comprador. */
export function destinoPosCompra(): string {
  if (paginaPronta(upsell)) return ROTA_UPSELL;
  if (paginaPronta(downsell)) return ROTA_DOWNSELL;
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
