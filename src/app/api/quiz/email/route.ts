import { NextResponse } from 'next/server';
import { supabaseAdmin, supabaseConfigured } from '@/lib/supabase';
import { verificar } from '@/lib/email/token';
import { BASE } from '@/lib/email/quiz-emails';

/**
 * Cliques dos e-mails do quiz.
 *  - `?acao=confirmar&t=…`: dupla confirmação do aceite. Só aqui o e-mail
 *    passa a poder receber lembrete (aceite_email_confirmado_em).
 *  - `?acao=sair&t=…`: sai da lista (aceite_email = false; o gatilho do banco
 *    zera as datas). Também aceita POST (List-Unsubscribe-Post, um clique).
 * O token é assinado e carrega o e-mail: ninguém mexe no aceite de outra pessoa.
 */
export const runtime = 'nodejs';

async function tratar(request: Request): Promise<NextResponse> {
  const u = new URL(request.url);
  const acao = u.searchParams.get('acao');
  const t = u.searchParams.get('t') ?? '';
  const ir = (status: string) => NextResponse.redirect(`${BASE}/quiz/email?status=${status}`, 303);
  if (acao !== 'confirmar' && acao !== 'sair') return ir('invalido');
  const email = verificar(t, acao);
  if (!email || !supabaseConfigured()) return ir('invalido');

  const db = supabaseAdmin().from('quiz_respostas');
  if (acao === 'confirmar') {
    const { data, error } = await db
      .update({ aceite_email_confirmado_em: new Date().toISOString() })
      .eq('email', email)
      .eq('aceite_email', true)
      .select('email');
    if (error) return ir('erro');
    return ir(data && data.length ? 'confirmado' : 'invalido');
  }
  const { error } = await db.update({ aceite_email: false }).eq('email', email);
  return ir(error ? 'erro' : 'saiu');
}

export const GET = tratar;
export const POST = tratar;
