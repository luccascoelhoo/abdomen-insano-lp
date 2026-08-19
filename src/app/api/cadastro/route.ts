import { NextResponse } from 'next/server';
import { buscarCompraAprovadaPorEmail } from '@/lib/compra';
import { supabaseConfigured } from '@/lib/supabase';
import { buscarUsuarioPorEmail, criarUsuario } from '@/lib/usuario';

/**
 * Cadastro pós-compra.
 *
 * Fluxo:
 *   1. Cliente envia email + senha + nome (+ telefone opcional).
 *   2. Rota confere que existe compra APROVADA pra esse email.
 *   3. Se existir, cria usuário no banco compartilhado com o app.
 *   4. Se já existe usuário com esse email, devolve 409 (conta duplicada).
 *
 * Sem token de sessão nessa etapa — o cadastro só serve pra provisionar o
 * acesso no app. O login real acontece dentro do app usando as mesmas
 * credenciais gravadas aqui.
 */
export const runtime = 'nodejs';

type Corpo = {
  email?: string;
  senha?: string;
  nome?: string;
  telefone?: string;
};

export async function POST(request: Request) {
  if (!supabaseConfigured()) {
    return NextResponse.json(
      { ok: false, motivo: 'backend_nao_configurado' },
      { status: 503 },
    );
  }

  let body: Corpo;
  try {
    body = (await request.json()) as Corpo;
  } catch {
    return NextResponse.json({ ok: false, motivo: 'json_invalido' }, { status: 400 });
  }

  const email = (body.email ?? '').trim();
  const senha = body.senha ?? '';
  const nome = (body.nome ?? '').trim();
  const telefone = (body.telefone ?? '').trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, motivo: 'email_invalido' }, { status: 400 });
  }
  if (senha.length < 8) {
    return NextResponse.json({ ok: false, motivo: 'senha_curta' }, { status: 400 });
  }
  if (nome.length < 2) {
    return NextResponse.json({ ok: false, motivo: 'nome_invalido' }, { status: 400 });
  }

  try {
    const compra = await buscarCompraAprovadaPorEmail(email);
    if (!compra) {
      return NextResponse.json(
        { ok: false, motivo: 'compra_nao_encontrada' },
        { status: 402 },
      );
    }

    const existente = await buscarUsuarioPorEmail(email);
    if (existente) {
      return NextResponse.json(
        { ok: false, motivo: 'ja_cadastrado' },
        { status: 409 },
      );
    }

    const usuario = await criarUsuario({
      email,
      senha,
      nome,
      telefone: telefone || null,
      compra_id: compra.id,
    });

    return NextResponse.json({
      ok: true,
      usuario: { id: usuario.id, email: usuario.email, nome: usuario.nome },
    });
  } catch (erro) {
    console.error('[cadastro] falha', erro);
    return NextResponse.json({ ok: false, motivo: 'erro_cadastro' }, { status: 500 });
  }
}
