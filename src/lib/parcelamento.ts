/**
 * O parcelamento que o checkout da Cakto cobra de verdade.
 *
 * Existe porque a copy pode prometer uma parcela que não existe: o produto
 * repassa os juros ao comprador (`absorbInstallmentInterest: false`), então
 * "R$ 64 em 12x" não é R$ 5,33, é o que a Cakto calcula. Lendo daqui, a página
 * mostra a mesma parcela que a pessoa vai ver no checkout.
 *
 * Mesma consulta pública de `lib/precos.ts` (sem token, guardada por 5 min).
 * Se a Cakto falhar, quem chama usa a reserva do conteúdo.
 */
const REVALIDAR_SEGUNDOS = 300;

export type Parcelamento = {
  /** Maior número de parcelas oferecido. */
  vezes: number;
  parcelaCentavos: number;
  avistaCentavos: number;
};

type RespostaCakto = {
  price?: unknown;
  product?: { calculatedInstallments?: Array<{ installment?: unknown; value?: unknown }> };
};

export async function parcelamentoDaOferta(slug: string): Promise<Parcelamento | null> {
  try {
    const r = await fetch(`https://api.cakto.com.br/api/product/checkout/${slug}/`, {
      next: { revalidate: REVALIDAR_SEGUNDOS },
      signal: AbortSignal.timeout(3000),
    });
    if (!r.ok) {
      console.error('[parcelamento] Cakto recusou; vale a reserva do conteúdo', { slug, status: r.status });
      return null;
    }
    const dados = (await r.json()) as RespostaCakto;
    const avista = Number(dados.price);
    const opcoes = (dados.product?.calculatedInstallments ?? [])
      .map((o) => ({ vezes: Number(o.installment), valor: Number(o.value) }))
      .filter((o) => Number.isInteger(o.vezes) && o.vezes > 0 && Number.isFinite(o.valor) && o.valor > 0);
    if (!Number.isFinite(avista) || avista <= 0 || opcoes.length === 0) {
      console.error('[parcelamento] Cakto sem preço ou parcelas legíveis; vale a reserva', { slug });
      return null;
    }
    const maior = opcoes.reduce((a, b) => (b.vezes > a.vezes ? b : a));
    return {
      vezes: maior.vezes,
      parcelaCentavos: Math.round(maior.valor * 100),
      avistaCentavos: Math.round(avista * 100),
    };
  } catch (erro) {
    console.error('[parcelamento] Cakto não respondeu; vale a reserva do conteúdo', { slug, erro });
    return null;
  }
}

/** `6,62` a partir de 662 centavos; inteiro fica sem casas (`64`). */
export function reais(centavos: number): string {
  const valor = centavos / 100;
  return Number.isInteger(valor)
    ? String(valor)
    : valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
