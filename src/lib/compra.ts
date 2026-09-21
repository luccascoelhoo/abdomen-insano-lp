import { supabaseAdmin } from '@/lib/supabase';

/**
 * Contrato do módulo de compra. Isolado das rotas de API pra ficar fácil
 * substituir a persistência (hoje Supabase; amanhã pode ser Postgres direto,
 * ou o banco do próprio app se ele expuser API).
 */

export type StatusCompra = 'pendente' | 'aprovada' | 'estornada' | 'chargeback';

export type Compra = {
  id: string;
  email: string;
  status: StatusCompra;
  gateway: string;
  transacao_id: string;
  valor_centavos: number;
  criado_em: string;
  aprovado_em: string | null;
  utm: Record<string, string> | null;
  /** Resultado do envio do Purchase ao Meta; nulo antes da migration ou antes da venda aprovar. */
  medicao?: string | null;
};

const TABLE = 'compras';
const TABLE_ENVIOS = 'eventos_capi';

export async function registrarOuAtualizarCompra(dados: {
  email: string;
  gateway: string;
  transacao_id: string;
  status: StatusCompra;
  valor_centavos: number;
  utm?: Record<string, string> | null;
}): Promise<Compra> {
  const cliente = supabaseAdmin();
  const email = normalizarEmail(dados.email);
  const agora = new Date().toISOString();

  // A origem só entra quando vem. Um postback sem o bloco de UTM (um estorno,
  // uma reentrega) não pode apagar a campanha que trouxe a venda: com a chave
  // fora do payload, o upsert deixa a coluna como está.
  const payload = {
    email,
    gateway: dados.gateway,
    transacao_id: dados.transacao_id,
    status: dados.status,
    valor_centavos: dados.valor_centavos,
    aprovado_em: dados.status === 'aprovada' ? agora : null,
    ...(dados.utm ? { utm: dados.utm } : {}),
  };

  const { data, error } = await cliente
    .from(TABLE)
    .upsert(payload, { onConflict: 'gateway,transacao_id' })
    .select('*')
    .single();

  if (error) throw error;
  return data as Compra;
}

export async function buscarCompraAprovadaPorEmail(email: string): Promise<Compra | null> {
  const cliente = supabaseAdmin();
  const { data, error } = await cliente
    .from(TABLE)
    .select('*')
    .eq('email', normalizarEmail(email))
    .eq('status', 'aprovada')
    .order('aprovado_em', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data as Compra) ?? null;
}

export async function buscarCompraPorTransacao(
  gateway: string,
  transacao_id: string,
): Promise<Compra | null> {
  const cliente = supabaseAdmin();
  const { data, error } = await cliente
    .from(TABLE)
    .select('*')
    .eq('gateway', gateway)
    .eq('transacao_id', transacao_id)
    .maybeSingle();
  if (error) throw error;
  return (data as Compra) ?? null;
}

/**
 * O resultado do envio ao Meta, guardado ao lado da venda.
 *
 * Sem isto a única prova de que uma venda foi medida vive no log da Vercel,
 * que expira, e no Events Manager, que não sabe qual venda é qual. Com a
 * coluna, "quantas vendas o Meta recebeu esta semana" vira uma consulta, e
 * venda sem evento vira alarme possível.
 *
 * Falha aqui não pode derrubar o webhook: a compra já está gravada e o
 * Purchase já saiu. Se a coluna ainda não existir no banco (a migration é
 * aplicada pelo dono do projeto), fica no log e segue.
 */
export async function registrarMedicaoDaCompra(
  gateway: string,
  transacao_id: string,
  medicao: string,
): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin()
      .from(TABLE)
      .update({ medicao })
      .eq('gateway', gateway)
      .eq('transacao_id', transacao_id);
    if (error) throw error;
    return true;
  } catch (erro) {
    console.error('[compra] medição não gravada', { transacao_id, medicao, erro });
    return false;
  }
}

/**
 * Cada envio pela Conversions API, um por linha: evento, `event_id`, resultado.
 *
 * É o equivalente do `capi_envios` do padrão da casa. Serve para auditar fora
 * do painel do Meta e para conferir a deduplicação: o mesmo `event_id` que o
 * navegador usou tem que aparecer aqui.
 *
 * Mesma regra da função acima: nunca derruba quem chamou.
 */
export async function registrarEnvioCapi(dados: {
  evento: string;
  event_id: string;
  resultado: string;
  transacao_id?: string;
  caminho?: string;
}): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin().from(TABLE_ENVIOS).insert({
      evento: dados.evento,
      event_id: dados.event_id,
      resultado: dados.resultado,
      transacao_id: dados.transacao_id ?? null,
      caminho: dados.caminho ?? null,
    });
    if (error) throw error;
    return true;
  } catch (erro) {
    console.error('[compra] envio CAPI não registrado', { ...dados, erro });
    return false;
  }
}

/**
 * O banco já tem onde guardar a medição?
 *
 * Responde ao diagnóstico do deploy sem gravar nada: uma leitura da coluna
 * `medicao` e uma da tabela de envios. Antes da migration as duas falham, e
 * o `GET /api/webhook/cakto` mostra isso em vez de deixar a pergunta para a
 * primeira venda.
 */
export async function medicaoPersistivel(): Promise<{ coluna: boolean; envios: boolean }> {
  const cliente = supabaseAdmin();
  const coluna = !(await cliente.from(TABLE).select('medicao').limit(1)).error;
  const envios = !(await cliente.from(TABLE_ENVIOS).select('id').limit(1)).error;
  return { coluna, envios };
}

export function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}
