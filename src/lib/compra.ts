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
};

const TABLE = 'compras';

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

  const payload = {
    email,
    gateway: dados.gateway,
    transacao_id: dados.transacao_id,
    status: dados.status,
    valor_centavos: dados.valor_centavos,
    aprovado_em: dados.status === 'aprovada' ? agora : null,
    utm: dados.utm ?? null,
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

export function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}
