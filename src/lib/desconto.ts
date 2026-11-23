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

/**
 * Nome do cupom mostrado no quiz: o primeiro nome da pessoa + o percentual
 * (ex.: RAFAEL79). É só o rótulo do desconto, que já vem aplicado: ninguém
 * digita nada. Sem nome, usa QUIZ.
 */
export function cupomDaPessoa(nome: string | undefined, pct: number): string {
  const base = (nome ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z]/g, '')
    .toUpperCase()
    .slice(0, 12);
  return `${base || 'QUIZ'}${pct}`;
}
