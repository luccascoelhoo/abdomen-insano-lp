import { PRODUTOS, type Precos, type Recorrencia, type Recorrencias, type Produto } from '@/lib/produtos';

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

type DadosOferta = { centavos: number; recorrencia: Recorrencia | null };

async function dadosDaOferta(slug: string): Promise<DadosOferta | null> {
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
    const dados = (await r.json()) as {
      price?: unknown;
      type?: unknown;
      recurrence_period?: unknown;
    };
    const reais = Number(dados.price);
    if (!Number.isFinite(reais) || reais <= 0) {
      console.error('[precos] Cakto sem preço válido; vale o preço de referência', { slug, price: dados.price });
      return null;
    }

    // A recorrência só vale quando os DOIS campos vieram coerentes. Período
    // inventado numa oferta de assinatura é pior que período nenhum: a página
    // promete uma frequência de cobrança que o cartão não vai seguir.
    const dias = Number(dados.recurrence_period);
    const tipo = dados.type === 'subscription' ? 'subscription' : 'unique';
    const recorrencia: Recorrencia | null =
      tipo === 'unique'
        ? { tipo, periodoDias: 0 }
        : Number.isFinite(dias) && dias > 0
          ? { tipo, periodoDias: Math.round(dias) }
          : null;
    if (!recorrencia) {
      console.error('[precos] assinatura sem período legível na Cakto', { slug, recurrence_period: dados.recurrence_period });
    }

    return { centavos: Math.round(reais * 100), recorrencia };
  } catch (erro) {
    console.error('[precos] Cakto não respondeu; vale o preço de referência', { slug, erro });
    return null;
  }
}

async function lerOfertas(): Promise<ReadonlyArray<readonly [string, DadosOferta | null]>> {
  return Promise.all(
    (PRODUTOS as readonly Produto[])
      .filter((p) => p.oferta)
      .map(async (p) => [p.id, await dadosDaOferta(p.oferta!)] as const),
  );
}

export async function precosAtuais(): Promise<Precos> {
  const precos: Precos = {};
  for (const [id, dados] of await lerOfertas()) if (dados) precos[id] = dados.centavos;
  return precos;
}

/**
 * Como a Cakto cobra cada degrau. Mesma consulta e mesmo cache do preço.
 *
 * Existe porque preço e periodicidade são a MESMA promessa: anunciar R$ 127
 * sem dizer de quanto em quanto tempo é meia informação, e escrever a
 * periodicidade à mão repete o defeito que o preço vivo acabou de corrigir.
 */
export async function recorrenciasAtuais(): Promise<Recorrencias> {
  const mapa: Recorrencias = {};
  for (const [id, dados] of await lerOfertas()) {
    if (dados?.recorrencia) mapa[id] = dados.recorrencia;
  }
  return mapa;
}
