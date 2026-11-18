import { NextResponse } from 'next/server';
import { buscarCompraAprovadaPorEmail } from '@/lib/compra';
import { supabaseAdmin, supabaseConfigured } from '@/lib/supabase';
import { emailConfigurado, enviarEmail } from '@/lib/email/brevo';
import { BASE, emailLembrete, respostasDaLinha } from '@/lib/email/quiz-emails';
import { assinar } from '@/lib/email/token';

/**
 * Lembretes do quiz, chamados 1x por dia pelo cron da Vercel (vercel.json).
 *
 * Só para quem marcou o aceite E confirmou pelo link (dupla confirmação) E
 * não comprou. Etapa 1: 20 h depois do quiz. Etapa 2: 2 dias depois da 1.
 * Quem comprou sai da fila (lembrete_etapa = 9). Lote limitado por execução
 * para caber no limite diário da Brevo.
 */
export const runtime = 'nodejs';
export const maxDuration = 60;

const LOTE = 120;
const H = 3_600_000;

type Linha = {
  email: string;
  nome: string | null;
  app: Record<string, unknown> | null;
  extras: Record<string, unknown> | null;
  lembrete_etapa: number;
};

export async function GET(request: Request) {
  // A Vercel manda `Authorization: Bearer <CRON_SECRET>` nas chamadas do cron.
  const segredo = process.env.CRON_SECRET;
  if (!segredo || request.headers.get('authorization') !== `Bearer ${segredo}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  if (!supabaseConfigured() || !emailConfigurado()) {
    return NextResponse.json({ ok: true, motivo: 'nao_configurado' });
  }

  const agora = Date.now();
  const db = supabaseAdmin();
  const campos = 'email, nome, app, extras, lembrete_etapa';
  const [e1, e2] = await Promise.all([
    db
      .from('quiz_respostas')
      .select(campos)
      .eq('aceite_email', true)
      .not('aceite_email_confirmado_em', 'is', null)
      .eq('lembrete_etapa', 0)
      .lte('criado_em', new Date(agora - 20 * H).toISOString())
      .limit(LOTE),
    db
      .from('quiz_respostas')
      .select(campos)
      .eq('aceite_email', true)
      .not('aceite_email_confirmado_em', 'is', null)
      .eq('lembrete_etapa', 1)
      .lte('lembrete_em', new Date(agora - 44 * H).toISOString())
      .limit(LOTE),
  ]);
  if (e1.error || e2.error) {
    console.error('[lembretes] consulta falhou', { e1: e1.error?.code, e2: e2.error?.code });
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const fila = [...((e1.data ?? []) as Linha[]), ...((e2.data ?? []) as Linha[])].slice(0, LOTE);
  const conta = { enviados: 0, compraram: 0, falhas: 0 };
  for (const l of fila) {
    if (await buscarCompraAprovadaPorEmail(l.email).catch(() => null)) {
      await db.from('quiz_respostas').update({ lembrete_etapa: 9 }).eq('email', l.email);
      conta.compraram++;
      continue;
    }
    const etapa = (l.lembrete_etapa + 1) as 1 | 2;
    const t = assinar(l.email, 'sair');
    if (!t) return NextResponse.json({ ok: false, motivo: 'sem_segredo' }, { status: 500 });
    const m = emailLembrete(etapa, respostasDaLinha(l), `${BASE}/api/quiz/email?acao=sair&t=${t}`);
    const r = await enviarEmail({
      para: l.email,
      nome: l.nome ?? undefined,
      assunto: m.assunto,
      html: m.html,
      texto: m.texto,
      tags: [`quiz-lembrete-${etapa}`],
      descadastro: `${BASE}/api/quiz/email?acao=sair&t=${t}`,
    });
    if (!r.ok) {
      conta.falhas++;
      console.error('[lembretes] envio falhou', { etapa, motivo: r.motivo });
      continue;
    }
    await db
      .from('quiz_respostas')
      .update({ lembrete_etapa: etapa, lembrete_em: new Date().toISOString() })
      .eq('email', l.email);
    conta.enviados++;
  }
  return NextResponse.json({ ok: true, ...conta, fila: fila.length });
}
