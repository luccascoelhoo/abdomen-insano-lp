import type { Recorrencia } from '@/lib/produtos';

const MOEDA = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/**
 * Como dizer "a cada N dias" sem o leitor ter que fazer conta.
 *
 * O contrato literal vem primeiro — é o número de dias que a Cakto usa para
 * cobrar — e a leitura em português vem entre parênteses só quando o período
 * fecha certo. 45 dias não vira "mês e meio": fica 45 dias, porque é isso que
 * o cartão vê.
 */
export function periodoEmPalavras(dias: number): string {
  if (dias === 30) return 'a cada 30 dias (todo mês)';
  if (dias === 365) return 'a cada 365 dias (uma vez por ano)';
  if (dias === 7) return 'toda semana';
  if (dias % 365 === 0) return `a cada ${dias / 365} anos`;
  if (dias % 30 === 0) return `a cada ${dias / 30} meses`;
  return `a cada ${dias} dias`;
}

/** Sufixo curto do rótulo do botão: "/mês", "/ano", "/45 dias". */
export function sufixoDoBotao(dias: number): string {
  if (dias === 30) return '/mês';
  if (dias === 365) return '/ano';
  if (dias === 7) return '/semana';
  return `/${dias} dias`;
}

/**
 * A frase de preço e periodicidade exibida colada no botão.
 *
 * Quando a Cakto não devolve o período de uma assinatura, a frase NÃO inventa
 * um: ela manda conferir no checkout. Período errado numa página de pós-compra
 * é o que gera disputa, e disputa custa mais do que a venda que a frase
 * genérica deixa de fechar.
 */
export function condicoesDaOferta(
  centavos: number | undefined,
  recorrencia: Recorrencia | undefined,
): string {
  if (!centavos || !recorrencia) {
    return 'Confira o valor e a periodicidade no checkout antes de confirmar.';
  }
  const valor = MOEDA.format(centavos / 100);
  if (recorrencia.tipo === 'unique') {
    return `${valor}, pagamento único. Sem renovação e sem mensalidade.`;
  }
  return `Assinatura de ${valor}, cobrada ${periodoEmPalavras(recorrencia.periodoDias)}. Renova sozinha até você cancelar, e dá pra cancelar quando quiser.`;
}
