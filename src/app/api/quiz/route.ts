import { after, NextResponse } from 'next/server';
import { normalizarEmail } from '@/lib/compra';
import { supabaseAdmin, supabaseConfigured } from '@/lib/supabase';
import { validarCorpoQuiz, type CorpoQuizValido } from './validar';

/**
 * Recebe as respostas do quiz (`/quiz`) — fase 1 da ponte quiz → app.
 *
 * O elo entre o quiz e a compra é o e-mail: quem responde aqui e depois compra
 * com o mesmo e-mail deve encontrar o cadastro do app já preenchido (fase 2,
 * `docs/quiz-fase2.md`). Esta rota só GUARDA; quem importa é o app, e só depois
 * do e-mail da conta confirmado.
 *
 * Regras:
 *  - grava em `public.quiz_respostas` (RLS ligada, sem policy, sem grant para
 *    anon/authenticated) pela service role, só no servidor;
 *  - só grava com `QUIZ_GRAVAR=1` e o Supabase configurado. Sem isso, valida e
 *    responde igual (em dev, loga) — a tabela pode nem existir ainda;
 *  - a resposta é sempre vazia: nunca devolve o que está gravado, nem diz se o
 *    e-mail já existia. Ninguém lê o quiz de outra pessoa por aqui;
 *  - o mesmo e-mail reenviado sobrescreve as respostas (upsert por e-mail).
 *    Quem digita o e-mail alheio só troca respostas de pré-preenchimento, que
 *    nunca liberam acesso nem confirmam e-mail;
 *  - campo-isca (`site`) preenchido responde 204 e não grava;
 *  - limite de requisições por IP, em memória.
 */
export const runtime = 'nodejs';

/** Corpo maior que isto não é um quiz. */
const MAX_BYTES = 16 * 1024;

/* --------------------------------------------------------------- rate limit */

/**
 * 10 envios por minuto por IP. **Por instância**: cada função do Vercel tem o
 * seu Map, então o limite real é 10 × instâncias quentes, e zera num cold
 * start. É freio para robô burro e clique repetido, não proteção forte — essa,
 * se um dia for preciso, mora no firewall do Vercel.
 */
const JANELA_MS = 60_000;
const LIMITE_POR_JANELA = 10;
const MAX_IPS = 5_000;
const acessos = new Map<string, { inicio: number; n: number }>();

function excedeuLimite(ip: string, agora = Date.now()): boolean {
  if (acessos.size > MAX_IPS) {
    for (const [k, v] of acessos) if (agora - v.inicio > JANELA_MS) acessos.delete(k);
    if (acessos.size > MAX_IPS) acessos.clear();
  }
  const a = acessos.get(ip);
  if (!a || agora - a.inicio > JANELA_MS) {
    acessos.set(ip, { inicio: agora, n: 1 });
    return false;
  }
  a.n += 1;
  return a.n > LIMITE_POR_JANELA;
}

function ipDe(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for');
  return (fwd?.split(',')[0] ?? request.headers.get('x-real-ip') ?? 'desconhecido').trim();
}

/** Mesma regra de `api/evento`: só páginas deste site. */
function daCasa(request: Request): boolean {
  const permitido = (valor: string | null) => {
    if (!valor) return false;
    try {
      const host = new URL(valor).host;
      return (
        host === 'abdomeninsano.com.br' ||
        host === 'www.abdomeninsano.com.br' ||
        host.endsWith('.abdomeninsano.com.br') ||
        host === 'localhost' ||
        host.startsWith('localhost:')
      );
    } catch {
      return false;
    }
  };
  return permitido(request.headers.get('origin')) || permitido(request.headers.get('referer'));
}

/* ------------------------------------------------------------------ gravação */

const gravar = () => process.env.QUIZ_GRAVAR === '1' && supabaseConfigured();
const emDev = process.env.NODE_ENV !== 'production';

/** Versão do texto do checkbox de aceite (TelaEmail). Mudou o texto, sobe aqui. */
const TEXTO_ACEITE = 'quiz-v1';

async function salvar(d: CorpoQuizValido, ua: string): Promise<void> {
  const agora = new Date().toISOString();
  // `consumido_em` e `criado_em` ficam fora: o upsert não os toca.
  const { error } = await supabaseAdmin()
    .from('quiz_respostas')
    .upsert(
      {
        email: normalizarEmail(d.email),
        nome: d.nome,
        aceite_email: d.aceiteEmail,
        // O gatilho do banco preserva o primeiro aceite; desmarcar revoga.
        aceite_email_em: d.aceiteEmail ? agora : null,
        aceite_email_texto: d.aceiteEmail ? TEXTO_ACEITE : null,
        aceite_email_ua: d.aceiteEmail ? ua.slice(0, 300) : null,
        app: d.app,
        extras: d.extras,
        utm: d.utm,
        atualizado_em: agora,
      },
      { onConflict: 'email' },
    );
  // Sem o e-mail no log: o código do erro basta para achar o problema.
  if (error) console.error('[api/quiz] falha ao gravar', { code: error.code, message: error.message });
}

/* ------------------------------------------------------------------- handler */

const vazio = () => new NextResponse(null, { status: 204 });

export async function POST(request: Request) {
  if (!daCasa(request)) {
    return NextResponse.json({ ok: false, motivo: 'origem_invalida' }, { status: 403 });
  }
  if (excedeuLimite(ipDe(request))) {
    return NextResponse.json({ ok: false, motivo: 'muitas_requisicoes' }, { status: 429 });
  }

  let corpo: unknown;
  try {
    const texto = await request.text();
    if (texto.length > MAX_BYTES) {
      return NextResponse.json({ ok: false, motivo: 'corpo_grande' }, { status: 413 });
    }
    corpo = JSON.parse(texto);
  } catch {
    return NextResponse.json({ ok: false, motivo: 'json_invalido' }, { status: 400 });
  }

  const r = validarCorpoQuiz(corpo);
  if (!r.ok) return NextResponse.json({ ok: false, motivo: r.motivo }, { status: 400 });
  if (r.isca) return vazio();

  if (emDev && r.descartados.length > 0) console.warn('[api/quiz] campos descartados', r.descartados);

  if (gravar()) {
    // Responde já; a escrita termina depois da resposta (`after`), sem segurar
    // o navegador de quem está indo para o checkout.
    const ua = request.headers.get('user-agent') ?? '';
    after(() => salvar(r.dados, ua).catch((e) => console.error('[api/quiz] erro ao gravar', e)));
  } else if (emDev) {
    console.info('[api/quiz] válido, não gravado (QUIZ_GRAVAR != 1 ou Supabase ausente)', {
      app: r.dados.app,
      extras: Object.keys(r.dados.extras),
      utm: r.dados.utm,
    });
  }
  return vazio();
}
