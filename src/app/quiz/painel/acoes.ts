'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { COOKIE_PAINEL, DURACAO_S, criarSessao, falhasRecentes, registrarFalha, senhaCerta, travado } from '@/lib/quiz-painel';

export async function entrar(_anterior: string, dados: FormData): Promise<string> {
  if (travado(await falhasRecentes())) return 'Muitas tentativas. Tente de novo em 15 minutos.';
  const tentativa = String(dados.get('senha') ?? '').trim();
  const sessao = criarSessao();
  if (!sessao) return 'Painel não configurado.';
  if (!senhaCerta(tentativa)) {
    await registrarFalha();
    return 'Senha incorreta.';
  }
  (await cookies()).set(COOKIE_PAINEL, sessao, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/quiz/painel',
    maxAge: DURACAO_S,
  });
  redirect('/quiz/painel');
}

export async function sair(): Promise<void> {
  (await cookies()).delete({ name: COOKIE_PAINEL, path: '/quiz/painel' });
  redirect('/quiz/painel');
}
