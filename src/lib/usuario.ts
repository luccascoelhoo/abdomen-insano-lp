import bcrypt from 'bcryptjs';
import { normalizarEmail } from '@/lib/compra';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Cadastro de usuário. Guarda o mesmo esquema que o app consome:
 * email, senha_hash (bcrypt), nome, telefone, compra_id.
 *
 * Se o app usa Supabase Auth em vez de tabela própria, trocar
 * `criarUsuario` por `supabaseAdmin().auth.admin.createUser(...)` e
 * usar a mesma coluna `email` como pivô.
 */

const TABLE = 'usuarios';
const BCRYPT_ROUNDS = 12;

export type Usuario = {
  id: string;
  email: string;
  nome: string;
  telefone: string | null;
  compra_id: string | null;
  criado_em: string;
};

export async function buscarUsuarioPorEmail(email: string): Promise<Usuario | null> {
  const cliente = supabaseAdmin();
  const { data, error } = await cliente
    .from(TABLE)
    .select('id, email, nome, telefone, compra_id, criado_em')
    .eq('email', normalizarEmail(email))
    .maybeSingle();
  if (error) throw error;
  return (data as Usuario) ?? null;
}

export async function criarUsuario(dados: {
  email: string;
  senha: string;
  nome: string;
  telefone?: string | null;
  compra_id: string;
}): Promise<Usuario> {
  const cliente = supabaseAdmin();
  const senha_hash = await bcrypt.hash(dados.senha, BCRYPT_ROUNDS);
  const payload = {
    email: normalizarEmail(dados.email),
    nome: dados.nome.trim(),
    telefone: dados.telefone?.trim() || null,
    senha_hash,
    compra_id: dados.compra_id,
  };
  const { data, error } = await cliente
    .from(TABLE)
    .insert(payload)
    .select('id, email, nome, telefone, compra_id, criado_em')
    .single();
  if (error) throw error;
  return data as Usuario;
}
