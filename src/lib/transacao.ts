/**
 * O identificador da venda, e o `event_id` que nasce dele.
 *
 * Existe porque o mesmo pagamento chega por dois caminhos com nomes diferentes:
 * a URL de retorno do gateway, lida pelo navegador, e o corpo do postback, lido
 * pelo servidor. Se cada lado derivar o `event_id` do seu próprio campo e os
 * campos não forem o mesmo, o Meta recebe dois eventos que não se reconhecem e
 * conta a venda duas vezes — o custo por resultado aparece pela metade do real.
 *
 * Uma função só, usada pelos dois lados, é o que garante que o id é o mesmo.
 */

/** Nomes que gateways usam para a mesma coisa, do mais específico ao mais genérico. */
const CAMPOS_DE_ID = [
  'transaction_id',
  'transactionId',
  'transacao_id',
  'payment_id',
  'paymentId',
  'order_id',
  'orderId',
  'reference',
  'ref',
  'tx',
  'id',
] as const;

/**
 * Acha o identificador da transação num objeto de query string ou de payload.
 *
 * A ordem da lista é a preferência: quando o gateway manda id do pagamento e id
 * do pedido no mesmo lugar, os dois lados precisam escolher o mesmo, e escolher
 * sempre o primeiro da lista é o que torna a escolha previsível.
 */
export function idDaTransacao(fonte: Record<string, unknown> | undefined | null): string | null {
  if (!fonte) return null;
  for (const campo of CAMPOS_DE_ID) {
    const bruto = fonte[campo];
    if (typeof bruto === 'string' || typeof bruto === 'number') {
      const limpo = String(bruto).trim();
      if (limpo) return limpo;
    }
  }
  return null;
}

/**
 * O `event_id` da venda. Determinístico de propósito: dois postbacks da mesma
 * transação produzem o mesmo id, e o Meta conta uma venda só.
 */
export function eventIdDaTransacao(transacaoId: string): string {
  return `cakto:${transacaoId.trim()}`;
}
