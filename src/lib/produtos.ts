/**
 * Os níveis de receita do funil, e como reconhecer cada um.
 *
 * O funil vende em quatro degraus, todos no mesmo gateway e no mesmo pixel:
 * front, order bump, upsell e downsell. Se todos chegarem ao Meta como um
 * `Purchase` genérico, o custo por venda vira média de coisas diferentes e o
 * ROAS por criativo perde o sentido — um upsell de R$ 197 e um bump de R$ 9,90
 * contam igual.
 *
 * O reconhecimento é pelo **valor em centavos**, porque é o único campo que o
 * webhook garante hoje. Quando o payload real da Cakto for conhecido e trouxer
 * id de oferta, trocar a chave por ele: id é exato, valor é inferência, e
 * promoção ou cupom quebram a inferência.
 */

export type Produto = {
  id: string;
  nome: string;
  /** Degrau do funil, usado para separar as conversões personalizadas no Meta. */
  degrau: 'front' | 'bump' | 'upsell' | 'downsell';
  centavos: number;
};

export const PRODUTOS: Produto[] = [
  { id: 'dai-front', nome: 'Desafio Abdômen Insano', degrau: 'front', centavos: 4200 },
  { id: 'bump-op3em10', nome: 'Operação -3kg em 10 dias', degrau: 'bump', centavos: 1490 },
  { id: 'bump-testosterona', nome: 'Testosterona 5x', degrau: 'bump', centavos: 990 },
  { id: 'bump-vitalicio', nome: 'Acesso Vitalício', degrau: 'bump', centavos: 1990 },
  { id: 'si360-upsell', nome: 'Shape Insano 360', degrau: 'upsell', centavos: 19700 },
  { id: 'si360-downsell', nome: 'Shape Insano 360 (downsell)', degrau: 'downsell', centavos: 14700 },
];

const DESCONHECIDO: Produto = {
  id: 'desconhecido',
  nome: 'Compra não classificada',
  degrau: 'front',
  centavos: 0,
};

/**
 * Classifica pelo valor exato e, se não bater, pelo valor mais próximo dentro
 * de R$ 2,00. A folga existe porque taxa e arredondamento do gateway deslocam
 * centavos; acima disso é melhor devolver "não classificada" do que atribuir a
 * venda ao degrau errado e envenenar a otimização.
 */
export function classificarPorValor(centavos: number): Produto {
  const exato = PRODUTOS.find((p) => p.centavos === centavos);
  if (exato) return exato;

  let melhor: Produto | null = null;
  let menorDiferenca = Number.POSITIVE_INFINITY;
  for (const p of PRODUTOS) {
    const d = Math.abs(p.centavos - centavos);
    if (d < menorDiferenca) {
      menorDiferenca = d;
      melhor = p;
    }
  }
  return melhor && menorDiferenca <= 200 ? melhor : DESCONHECIDO;
}
