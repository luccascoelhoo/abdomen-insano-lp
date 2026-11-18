import { ofertaV2 } from '@/content/lp-v2';

/**
 * Desconto mostrado no quiz: a mesma conta da página de vendas, que risca o
 * preço de referência (`ofertaV2.card.precoDe`, "R$299") e vende por R$ 64.
 * Nada inventado: o percentual sai dos dois preços que a própria página mostra.
 */

/** Preço de referência (riscado) em centavos, lido da copy da página de vendas. */
export const PRECO_REFERENCIA_CENTAVOS = Number(ofertaV2.card.precoDe.replace(/\D/g, '')) * 100;

/** Percentual de desconto do preço à vista sobre a referência (arredondado). */
export function descontoPercentual(avistaCentavos: number, referenciaCentavos = PRECO_REFERENCIA_CENTAVOS): number {
  if (!referenciaCentavos || avistaCentavos >= referenciaCentavos) return 0;
  return Math.round((1 - avistaCentavos / referenciaCentavos) * 100);
}

export const brl = (centavos: number): string =>
  (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: centavos % 100 ? 2 : 0 });
