import { after, NextResponse } from 'next/server';
import { supabaseAdmin, supabaseConfigured } from '@/lib/supabase';
import { validarLotePlayer, type LoteValido } from './validar';

/**
 * Recebe as métricas de retenção do Player Insano (o nosso player de VSL).
 *
 * O player junta eventos (`LotePlayer`, em `src/components/player/tipos.ts`) e
 * manda por `navigator.sendBeacon` — por isso o corpo pode chegar como
 * `text/plain` ou `application/json`: a rota lê o texto cru e faz o parse.
 *
 * Regras:
 *  - grava em `public.player_eventos` (RLS ligada, sem policy, sem grant para
 *    anon/authenticated) pela service role, só no servidor. Uma linha por
 *    evento. Leitura: função `player_retencao` (`supabase/player_eventos.sql`);
 *  - só grava com `PLAYER_GRAVAR=1` e o Supabase configurado. Sem isso, valida
 *    e responde igual (em dev, loga) — a tabela pode nem existir ainda;
 *  - NÃO guarda IP nem user agent. A sessão é um id aleatório do player, que
 *    não identifica a pessoa;
 *  - a resposta é sempre vazia (204). O beacon nem lê a resposta;
 *  - limite de requisições por IP, em memória.
 *
 * `GET` devolve só o país da visita (filtro de tráfego do player).
 */
export const runtime = 'nodejs';

/** 200 eventos + UTMs cabem folgado. O `sendBeacon` aceita até ~64 KB. */
const MAX_BYTES = 32 * 1024;

/* --------------------------------------------------------------- rate limit */

/**
 * 60 lotes por minuto por IP. Mais folgado que o quiz: em rede móvel muita
 * gente sai pelo mesmo IP (CGNAT) e cada pessoa manda vários lotes por vídeo.
 * **Por instância**: cada função do Vercel tem o seu Map, então o limite real
 * é 60 × instâncias quentes, e zera num cold start. É freio para robô burro e
 * laço no cliente, não proteção forte — essa, se um dia for preciso, mora no
 * firewall do Vercel.
 */
const JANELA_MS = 60_000;
const LIMITE_POR_JANELA = 60;
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

/** IP só como chave do limite em memória. Nunca é gravado nem logado. */
function ipDe(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for');
  return (fwd?.split(',')[0] ?? request.headers.get('x-real-ip') ?? 'desconhecido').trim();
}

/** Mesma regra de `api/evento` e `api/quiz`: só páginas deste site. */
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

const gravar = () => process.env.PLAYER_GRAVAR === '1' && supabaseConfigured();
const emDev = process.env.NODE_ENV !== 'production';

async function salvar(d: LoteValido): Promise<void> {
  const linhas = d.eventos.map((e) => ({
    video: d.video,
    sessao: d.sessao,
    pagina: d.pagina,
    tipo: e.tipo,
    segundo: e.segundo,
    utm: d.utm,
    variante: d.variante,
  }));
  const { error } = await supabaseAdmin().from('player_eventos').insert(linhas);
  if (error) {
    console.error('[api/player] falha ao gravar', { code: error.code, message: error.message, video: d.video });
  }
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

  // `sendBeacon` manda string como text/plain e Blob com o tipo do Blob: lê cru.
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

  const r = validarLotePlayer(corpo);
  if (!r.ok) return NextResponse.json({ ok: false, motivo: r.motivo }, { status: 400 });

  if (emDev && r.descartados > 0) console.warn('[api/player] eventos descartados', r.descartados);

  if (gravar()) {
    // Responde já; a escrita termina depois da resposta (`after`).
    after(() => salvar(r.dados).catch((e) => console.error('[api/player] erro ao gravar', e)));
  } else if (emDev) {
    console.info('[api/player] válido, não gravado (PLAYER_GRAVAR != 1 ou Supabase ausente)', {
      video: r.dados.video,
      pagina: r.dados.pagina,
      variante: r.dados.variante,
      eventos: r.dados.eventos.map((e) => `${e.tipo}@${e.segundo}`).join(' '),
    });
  }
  return vazio();
}

/**
 * País da visita para o filtro de tráfego do player (`filtro.paises`). A
 * Vercel põe o cabeçalho na borda; fora dela (dev), `null` e o filtro deixa
 * passar. Não lê nem guarda IP.
 */
export function GET(request: Request) {
  const pais = request.headers.get('x-vercel-ip-country');
  return NextResponse.json(
    { pais: pais && /^[A-Z]{2}$/.test(pais) ? pais : null },
    { headers: { 'cache-control': 'private, no-store' } },
  );
}
