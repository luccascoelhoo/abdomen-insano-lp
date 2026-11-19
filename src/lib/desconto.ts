import { textosResultado } from '@/content/quiz';

/**
 * Desconto mostrado no quiz: o preço riscado do próprio quiz
 * (`textosResultado.oferta.precoDe`) contra o preço à vista vivo da Cakto.
 * Nada inventado: o percentual sai da conta entre os dois preços que a tela
 * mostra. A página de vendas tem o seu próprio riscado (`ofertaV2.card.precoDe`).
 */

/** Preço de referência (riscado) do quiz, em centavos. */
export const PRECO_REFERENCIA_CENTAVOS = Number(textosResultado.oferta.precoDe.replace(/\D/g, '')) * 100;

/** Percentual de desconto do preço à vista sobre a referência (arredondado). */
export function descontoPercentual(avistaCentavos: number, referenciaCentavos = PRECO_REFERENCIA_CENTAVOS): number {
  if (!referenciaCentavos || avistaCentavos >= referenciaCentavos) return 0;
  return Math.round((1 - avistaCentavos / referenciaCentavos) * 100);
}

export const brl = (centavos: number): string =>
  (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: centavos % 100 ? 2 : 0 });
