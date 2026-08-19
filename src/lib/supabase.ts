import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase. Compartilhado com o app do desafio — a LP grava compras e
 * cadastros na mesma base que o app consulta pra liberar acesso.
 *
 * Duas chaves distintas:
 *  - `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`: cliente
 *    público (o browser recebe). Só faz leituras liberadas pela RLS.
 *  - `SUPABASE_SERVICE_ROLE_KEY`: chave de serviço. NUNCA sai do servidor.
 *    Usada nas rotas de API pra escrever compra/usuário e ler dados
 *    protegidos por RLS.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let cachedAdmin: SupabaseClient | null = null;

/** Cliente com service role — usar SÓ dentro de rotas de API. */
export function supabaseAdmin(): SupabaseClient {
  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL ausente');
  if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY ausente');
  cachedAdmin ??= createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cachedAdmin;
}

/** Cliente público — pode ser usado no browser via createClient direto. */
export function supabasePublicConfig() {
  if (!url || !anonKey) throw new Error('Supabase (public) não configurado');
  return { url, anonKey };
}

/** Descobre se as env vars mínimas do lado server estão presentes. */
export function supabaseConfigured(): boolean {
  return Boolean(url && serviceKey);
}
