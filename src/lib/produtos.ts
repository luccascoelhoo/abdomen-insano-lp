/**
 * Os níveis de receita do funil, e como reconhecer cada um.
 *
 * O funil vende em quatro degraus, todos no mesmo gateway e no mesmo pixel:
 * front, order bump, upsell e downsell. Se todos chegarem ao Meta como um
 * `Purchase` genérico, o custo por venda vira média de coisas diferentes e o
 * ROAS por criativo perde o sentido — um upsell de R$ 197 e um bump de R$ 9,90
 * contam igual.
 *
 * O reconhecimento é primeiro pela **oferta da Cakto** e, só se ela não vier,
 * pelo **valor em centavos**. Id é exato; valor é inferência, e mudança de
 * preço, promoção ou cupom quebram a inferência. Foi o que aconteceu em
 * 21/10/2026: o Desafio passou de R$ 42 para R$ 64 na Cakto, e toda venda nova
 * viraria "não classificada", fora da conversão que a campanha otimiza.
 *
 * Cuidado com o downsell: na Cakto ele é uma OFERTA do mesmo produto do
 * upsell, então a configuração pública devolve `product.price: 197` e
 * `price: 127`. O que vale aqui é o preço da oferta, que é o que a pessoa paga.
 * Conferido na oferta `vx548za` em 23/09/2026.
 *
 * `centavos` é o preço de referência. O preço vivo vem da Cakto (`lib/precos`)
 * e só cai para este quando a consulta falha.
 */

export type Produto = {
  id: string;
  nome: string;
  /** Degrau do funil, usado para separar as conversões personalizadas no Meta. */
  degrau: 'front' | 'bump' | 'upsell' | 'downsell';
  centavos: number;
  /** Slug da oferta na Cakto, o mesmo do link `pay.cakto.com.br/<slug>`. */
  oferta?: string;
};

/** Preço em centavos por id de produto. Parcial: o que faltar usa o de referência. */
export type Precos = Partial<Record<string, number>>;

/**
 * Como a Cakto cobra cada degrau, lido da própria Cakto.
 *
 * `periodoDias` é literalmente o `recurrence_period` da oferta — a doc da
 * Cakto define como "número de dias entre cada cobrança". Não é o mesmo que o
 * acesso concedido, e não dá para inferir de um degrau para o outro: em
 * 22/10/2026 o upsell estava em 30 e o downsell em 365.
 */
export type Recorrencia = { tipo: 'unique' | 'subscription'; periodoDias: number };
export type Recorrencias = Partial<Record<string, Recorrencia>>;

export const PRODUTOS = [
  { id: 'dai-front', nome: 'Desafio Abdômen Insano', degrau: 'front', centavos: 6400, oferta: 'jegvaw9_1000225' },
  { id: 'bump-op3em10', nome: 'Operação -3kg em 10 dias', degrau: 'bump', centavos: 1490 },
  { id: 'bump-testosterona', nome: 'Testosterona 5x', degrau: 'bump', centavos: 990 },
  { id: 'bump-vitalicio', nome: 'Acesso Vitalício', degrau: 'bump', centavos: 1990 },
  { id: 'si360-upsell', nome: 'Shape Insano 360', degrau: 'upsell', centavos: 19700, oferta: '39rfuow_1081230' },
  { id: 'si360-downsell', nome: 'Shape Insano 360 (downsell)', degrau: 'downsell', centavos: 12700, oferta: 'vx548za' },
] as const satisfies readonly Produto[];

/**
 * Os ids que existem de verdade. Quem aponta uma página do funil para um
 * degrau usa este tipo: id errado quebra no build, e não em silêncio no Meta.
 */
export type ProdutoId = (typeof PRODUTOS)[number]['id'];

/**
 * O degrau que a LP vende. Os eventos do front citam este id nas DUAS pernas
 * (navegador e Conversions API) — sem isso a conversão personalizada não tem
 * como separar o front do upsell, já que os dois moram no mesmo domínio.
 */
export const ID_FRONT = 'dai-front' satisfies ProdutoId;

export const DESCONHECIDO: Produto = {
  id: 'desconhecido',
  nome: 'Compra não classificada',
  degrau: 'front',
  centavos: 0,
};

/** Produto do catálogo pelo id, ou `undefined` se o id não for de um degrau conhecido. */
export function produtoPorId(id: string | undefined): Produto | undefined {
  if (!id) return undefined;
  return PRODUTOS.find((p) => p.id === id);
}

/**
 * O front somado a cada combinação possível de order bumps.
 *
 * O bump entra na MESMA transação do front, então o webhook recebe um valor só
 * (R$ 42 + R$ 14,90 = R$ 56,90) que não bate com nenhum degrau. Sem isto, toda
 * compra com bump virava "não classificada" e saía da conversão do front.
 */
function combinacoesDoFront(front: Produto): Produto[] {
  const bumps = PRODUTOS.filter((p) => p.degrau === 'bump');
  const combinacoes: Produto[] = [];
  for (let mascara = 1; mascara < 1 << bumps.length; mascara++) {
    const escolhidos = bumps.filter((_, i) => mascara & (1 << i));
    combinacoes.push({
      id: front.id,
      nome: [front.nome, ...escolhidos.map((b) => b.nome)].join(' + '),
      degrau: 'front',
      centavos: front.centavos + escolhidos.reduce((t, b) => t + b.centavos, 0),
    });
  }
  return combinacoes;
}

/** O preço que vale para o produto: o vivo, se veio, senão o de referência. */
export function precoDe(produto: Produto, precos?: Precos): number {
  const vivo = precos?.[produto.id];
  return typeof vivo === 'number' && vivo > 0 ? vivo : produto.centavos;
}

/**
 * Produto pela oferta da Cakto. Aceita o slug inteiro (`jegvaw9_1000225`), o
 * id curto antes do `_` (`jegvaw9`) e qualquer texto que contenha o slug, como
 * a URL do checkout. Id curto com menos de 6 caracteres não casa: seria
 * coincidência demais.
 */
export function produtoPorOferta(texto: string | null | undefined): Produto | undefined {
  const t = texto?.trim();
  if (!t || t.length < 6) return undefined;
  return (PRODUTOS as readonly Produto[]).find((p) => {
    if (!p.oferta) return false;
    const curto = p.oferta.split('_')[0];
    return t === p.oferta || t === curto || t.includes(p.oferta);
  });
}

/**
 * Classifica pelo valor exato e, se não bater, pelo valor mais próximo dentro
 * de R$ 2,00. A folga existe porque taxa e arredondamento do gateway deslocam
 * centavos; acima disso é melhor devolver "não classificada" do que atribuir a
 * venda ao degrau errado e envenenar a otimização.
 *
 * Front com bump volta com o id do front (`dai-front`), porque é isso que a
 * conversão personalizada do front filtra, e com os bumps no nome.
 */
export function classificarPorValor(centavos: number, precos?: Precos): Produto {
  // Preço vivo e preço de referência valem os dois: a venda feita antes de uma
  // troca de preço pode ser reentregue ou estornada depois dela.
  const vivos: Produto[] = PRODUTOS.map((p) => ({ ...p, centavos: precoDe(p, precos) }));
  const base: Produto[] = [...vivos, ...PRODUTOS.filter((p, i) => p.centavos !== vivos[i].centavos)];
  const fronts = base.filter((p) => p.id === ID_FRONT);
  const candidatos: readonly Produto[] = [...base, ...fronts.flatMap(combinacoesDoFront)];
  const exato = candidatos.find((p) => p.centavos === centavos);
  if (exato) return exato;

  let melhor: Produto | null = null;
  let menorDiferenca = Number.POSITIVE_INFINITY;
  for (const p of candidatos) {
    const d = Math.abs(p.centavos - centavos);
    if (d < menorDiferenca) {
      menorDiferenca = d;
      melhor = p;
    }
  }
  return melhor && menorDiferenca <= 200 ? melhor : DESCONHECIDO;
}

/**
 * O produto da venda: pela oferta, quando o gateway diz qual foi; pelo valor,
 * quando não diz. `por` registra qual dos dois decidiu, para o log mostrar se
 * o caminho exato está funcionando.
 *
 * O aviso pode citar mais de uma oferta: o do upsell pode trazer a do Desafio
 * como pedido de origem. Com várias, decide a que tem o preço do valor pago.
 * Com uma só, ela decide, a menos que o valor aponte com clareza para OUTRO
 * degrau conhecido: aí a oferta achada é provavelmente a de origem, não a
 * vendida, e o valor decide (`por: 'conflito'`). Cupom não cai aqui, porque
 * valor com desconto não bate com degrau nenhum e volta "não classificada".
 */
export function classificarVenda(venda: {
  ofertas?: readonly string[];
  centavos: number;
  precos?: Precos;
}): { produto: Produto; por: 'oferta' | 'valor' | 'conflito' } {
  const achados = [
    ...new Map(
      (venda.ofertas ?? [])
        .map(produtoPorOferta)
        .filter((p): p is Produto => Boolean(p))
        .map((p) => [p.id, p]),
    ).values(),
  ];
  const peloValor = classificarPorValor(venda.centavos, venda.precos);
  if (achados.length === 1) {
    const [unica] = achados;
    if (peloValor.id !== DESCONHECIDO.id && peloValor.id !== unica.id) {
      return { produto: peloValor, por: 'conflito' };
    }
    return { produto: unica, por: 'oferta' };
  }
  const pelaOferta = achados.find((p) => precoDe(p, venda.precos) === venda.centavos);
  if (pelaOferta) return { produto: pelaOferta, por: 'oferta' };
  return { produto: peloValor, por: 'valor' };
}
