/**
 * Repasse da venda ao Frota Metrics, o painel da agência.
 *
 * O banco deste projeto continua sendo a fonte da venda. O painel recebe uma
 * cópia com as UTMs para cruzar a venda com o gasto de cada anúncio, que é o
 * que o Gerenciador não mostra com o número do banco.
 *
 * Nunca derruba o webhook: sem variável configurada não envia, e falha de rede
 * ou resposta de erro só vira log. A venda já está gravada quando isto roda.
 *
 * Variáveis: FROTA_METRICS_SALE_URL, FROTA_METRICS_CLIENT_ID e
 * FROTA_METRICS_SALE_TOKEN (derivado por cliente no Frota Metrics).
 */

type StatusMetrics = 'approved' | 'refunded' | 'cancelled';

const STATUS: Record<string, StatusMetrics> = {
  aprovada: 'approved',
  estornada: 'refunded',
  chargeback: 'refunded',
};

export async function repassarVendaAoMetrics(venda: {
  gateway: 'cakto';
  transacao_id: string;
  status: string;
  valor_centavos: number;
  produto: string;
  utm: Record<string, string> | null;
}): Promise<string> {
  const url = process.env.FROTA_METRICS_SALE_URL;
  const clientId = process.env.FROTA_METRICS_CLIENT_ID;
  const token = process.env.FROTA_METRICS_SALE_TOKEN;
  if (!url || !clientId || !token) return 'nao_configurado';

  // Pendente não é venda: só entra quando vira aprovada, estorno ou contestação.
  const status = STATUS[venda.status];
  if (!status) return 'ignorado';

  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-sale-token': token },
      body: JSON.stringify({
        client_id: clientId,
        gateway: venda.gateway,
        external_id: venda.transacao_id,
        amount: venda.valor_centavos / 100,
        product_name: venda.produto,
        status,
        occurred_at: new Date().toISOString(),
        // Só a origem da campanha; fbc, fbp e sck são do Meta e não saem daqui.
        utm: venda.utm
          ? Object.fromEntries(Object.entries(venda.utm).filter(([k]) => k.startsWith('utm_')))
          : null,
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!r.ok) {
      console.error('[frota-metrics] repasse recusado', {
        transacao_id: venda.transacao_id,
        status: r.status,
        corpo: (await r.text()).slice(0, 200),
      });
      return `falhou:${r.status}`;
    }
    return 'enviado';
  } catch (erro) {
    console.error('[frota-metrics] repasse falhou', { transacao_id: venda.transacao_id, erro });
    return 'falhou:rede';
  }
}
