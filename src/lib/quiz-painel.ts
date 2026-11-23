import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { supabaseAdmin, supabaseConfigured } from '@/lib/supabase';

/**
 * Acesso aos painéis do quiz (`/quiz/painel`): uma senha (env
 * `QUIZ_PAINEL_SENHA`) que abre uma sessão de 12 h em cookie assinado
 * (HMAC com `QUIZ_TOKEN_SECRET`, httpOnly). Senha curta é fraca por natureza,
 * então tentativas erradas são limitadas no banco, para TODO mundo junto:
 * 10 erros em 15 min travam o login por 15 min (cerca de 40 palpites por hora
 * no total, não importa quantas instâncias ou IPs).
 */

export const COOKIE_PAINEL = 'ai_painel';
export const DURACAO_S = 12 * 3600;

const JANELA_MIN = 15;
const MAX_FALHAS = 10;

function segredo(): string | null {
  const s = process.env.QUIZ_TOKEN_SECRET;
  return s && s.length >= 32 ? s : null;
}

const assinatura = (exp: string, s: string) => createHmac('sha256', s).update(`painel:${exp}`).digest('base64url');

export function criarSessao(): string | null {
  const s = segredo();
  if (!s) return null;
  const exp = String(Math.floor(Date.now() / 1000) + DURACAO_S);
  return `${exp}.${assinatura(exp, s)}`;
}

function valida(valor: string | undefined): boolean {
  const s = segredo();
  if (!s || !valor || valor.length > 200) return false;
  const [exp, sig] = valor.split('.');
  if (!exp || !sig || Number(exp) < Math.floor(Date.now() / 1000)) return false;
  const esperado = Buffer.from(assinatura(exp, s));
  const recebido = Buffer.from(sig);
  return esperado.length === recebido.length && timingSafeEqual(esperado, recebido);
}

export async function logado(): Promise<boolean> {
  return valida((await cookies()).get(COOKIE_PAINEL)?.value);
}

export function senhaCerta(tentativa: string): boolean {
  const certa = process.env.QUIZ_PAINEL_SENHA;
  if (!certa || !tentativa) return false;
  const a = Buffer.from(tentativa);
  const b = Buffer.from(certa);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Falhas do último intervalo; em erro do banco, assume 0 (não trava quem é do time). */
export async function falhasRecentes(): Promise<number> {
  if (!supabaseConfigured()) return 0;
  try {
    const desde = new Date(Date.now() - JANELA_MIN * 60_000).toISOString();
    const { count } = await supabaseAdmin()
      .from('quiz_painel_falhas')
      .select('id', { count: 'exact', head: true })
      .gte('criado_em', desde);
    return count ?? 0;
  } catch {
    return 0;
  }
}

export const travado = (falhas: number) => falhas >= MAX_FALHAS;

export async function registrarFalha(): Promise<void> {
  if (!supabaseConfigured()) return;
  try {
    await supabaseAdmin().from('quiz_painel_falhas').insert({});
  } catch {}
}
