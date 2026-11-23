import { NextResponse } from 'next/server';
import { supabaseAdmin, supabaseConfigured } from '@/lib/supabase';

/**
 * Evento anônimo do funil do quiz (uma tela vista). Grava em `quiz_eventos`
 * pela service role. Responde sempre 204: quem mede não precisa saber o que
 * deu certo, e nada sobre o que está gravado volta pela rede.
 */
export const runtime = 'nodejs';

const JANELA_MS = 60_000;
const LIMITE = 120; // ~ uma tela a cada meio segundo, por IP
const acessos = new Map<string, { inicio: number; n: number }>();

function excedeu(ip: string, agora = Date.now()): boolean {
  if (acessos.size > 5_000) acessos.clear();
  const a = acessos.get(ip);
  if (!a || agora - a.inicio > JANELA_MS) {
    acessos.set(ip, { inicio: agora, n: 1 });
    return false;
  }
  a.n += 1;
  return a.n > LIMITE;
}

const int = (v: unknown, max: number): number | null =>
  typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= max ? v : null;
const texto = (v: unknown, max: number): string | null =>
  typeof v === 'string' && v.length > 0 && v.length <= max ? v : null;

export async function POST(req: Request) {
  const vazio = new NextResponse(null, { status: 204 });
  try {
    if (process.env.QUIZ_GRAVAR !== '1' || !supabaseConfigured()) return vazio;
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'x';
    if (excedeu(ip)) return vazio;
    const bruto = await req.text();
    if (bruto.length > 1024) return vazio;
    const b = JSON.parse(bruto) as Record<string, unknown>;
    const sessao = texto(b.sessao, 64);
    const tela = texto(b.tela, 40);
    const indice = int(b.indice, 200);
    if (!sessao || sessao.length < 8 || !tela || indice === null) return vazio;
    if (b.evento !== 'view' && b.evento !== 'voltar') return vazio;
    await supabaseAdmin().from('quiz_eventos').insert({
      sessao,
      evento: b.evento,
      indice,
      tela,
      indice_anterior: int(b.indiceAnterior, 200),
      ms_anterior: int(b.msAnterior, 86_400_000),
      origem: texto(b.origem, 60),
    });
  } catch {}
  return vazio;
}
