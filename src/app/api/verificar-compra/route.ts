import { NextResponse } from 'next/server';
import { buscarCompraAprovadaPorEmail } from '@/lib/compra';
import { supabaseConfigured } from '@/lib/supabase';

/**
 * Consulta rápida: "esse email tem compra aprovada?".
 * Usada pelo formulário de cadastro pra mostrar mensagem clara antes do submit.
 *
 * Nunca retorna dado sensível — só {aprovada: boolean}. Se o Supabase não está
 * configurado, responde 503 com aviso claro.
 */
export const runtime = 'nodejs';

export async function POST(request: Request) {
  if (!supabaseConfigured()) {
    return NextResponse.json(
      { ok: false, motivo: 'backend_nao_configurado' },
      { status: 503 },
    );
  }

  let body: { email?: string };
  try {
    body = (await request.json()) as { email?: string };
  } catch {
    return NextResponse.json({ ok: false, motivo: 'json_invalido' }, { status: 400 });
  }

  const email = (body.email ?? '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, motivo: 'email_invalido' }, { status: 400 });
  }

  try {
    const compra = await buscarCompraAprovadaPorEmail(email);
    return NextResponse.json({ ok: true, aprovada: Boolean(compra) });
  } catch (erro) {
    console.error('[verificar-compra] falha', erro);
    return NextResponse.json({ ok: false, motivo: 'erro_consulta' }, { status: 500 });
  }
}
