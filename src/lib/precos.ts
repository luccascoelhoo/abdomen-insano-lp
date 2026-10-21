import { PRODUTOS, type Precos, type Produto } from '@/lib/produtos';

/**
 * O preço de cada degrau, lido da própria Cakto.
 *
 * Existe porque o preço morava em dois lugares: na oferta da Cakto, que é o
 * que a pessoa paga, e escrito no código, que é o que a medição contava. Em
 * 21/10/2026 o Desafio passou de R$ 42 para R$ 64 na Cakto e o código continuou
 * mandando R$ 42 no ViewContent e no InitiateCheckout. Lendo daqui, quem muda o
 * preço no painel da Cakto muda a medição junto, sem deploy.
 *
 * A consulta é pública e não pede token (`api.cakto.com.br/api/product/checkout/<slug>/`).
 * Fica guardada por 5 minutos. Se a Cakto falhar ou demorar, o degrau usa o
 * preço de referência do catálogo: medir com o preço antigo é ruim, derrubar a
 * página é pior.
 */
const REVALIDAR_SEGUNDOS = 300;

async function precoDaOferta(slug: string): Promise<number | null> {
  try {
    const r = await fetch(`https://api.cakto.com.br/api/product/checkout/${slug}/`, {
      next: { revalidate: REVALIDAR_SEGUNDOS },
      signal: AbortSignal.timeout(3000),
    });
    // Sem log aqui, um slug trocado ou desativado na Cakto faria a medição
    // voltar ao preço de referência em silêncio, que é o defeito que este
    // arquivo existe para impedir.
    if (!r.ok) {
      console.error('[precos] Cakto recusou; vale o preço de referência', { slug, status: r.status });
      return null;
    }
    const dados = (await r.json()) as { price?: unknown };
    const reais = Number(dados.price);
    if (!Number.isFinite(reais) || reais <= 0) {
      console.error('[precos] Cakto sem preço válido; vale o preço de referência', { slug, price: dados.price });
      return null;
    }
    return Math.round(reais * 100);
  } catch (erro) {
    console.error('[precos] Cakto não respondeu; vale o preço de referência', { slug, erro });
    return null;
  }
}

export async function precosAtuais(): Promise<Precos> {
  const pares = await Promise.all(
    (PRODUTOS as readonly Produto[])
      .filter((p) => p.oferta)
      .map(async (p) => [p.id, await precoDaOferta(p.oferta!)] as const),
  );
  const precos: Precos = {};
  for (const [id, centavos] of pares) if (centavos) precos[id] = centavos;
  return precos;
}
