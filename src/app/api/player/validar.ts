/**
 * Validação do lote de métricas que o Player Insano manda para `/api/player`
 * (contrato em `src/components/player/tipos.ts`).
 *
 * Escrita à mão, sem dependência nova e sem import de código (só de tipo).
 *
 * Regra geral:
 *  - `video`, `sessao`, `pagina` ou `eventos` fora do formato recusam o lote
 *    inteiro (não dá para atribuir os eventos a nada);
 *  - mais de MAX_EVENTOS eventos recusa o lote (o player manda lotes menores);
 *  - um evento torto (tipo desconhecido, segundo fora da faixa) cai sozinho;
 *    se não sobrar nenhum, recusa;
 *  - `utm` tem teto de chaves e de tamanho, e o que passa disso cai.
 */

import type { TipoEventoPlayer } from '@/components/player/tipos';

export interface EventoValido {
  tipo: TipoEventoPlayer;
  segundo: number;
  em: number;
}

export interface LoteValido {
  video: string;
  sessao: string;
  pagina: string;
  eventos: EventoValido[];
  utm: Record<string, string>;
}

export type ResultadoValidacao =
  | { ok: true; dados: LoteValido; descartados: number }
  | { ok: false; motivo: string };

/* ------------------------------------------------------------------- limites */

/**
 * Todos os tipos do contrato. `Record` obriga a listar cada um: se
 * `TipoEventoPlayer` ganhar ou perder um tipo, o `tsc` acusa aqui (e a CHECK
 * de `supabase/player_eventos.sql` precisa mudar junto).
 */
const TIPOS: Record<TipoEventoPlayer, true> = {
  carregou: true,
  autoplay: true,
  som: true,
  play: true,
  pausa: true,
  progresso: true,
  retomou: true,
  do_inicio: true,
  marco: true,
  fim: true,
};

export const MAX_EVENTOS = 200;
/** 10 h de conteúdo. Nenhuma VSL passa disso. */
const MAX_SEGUNDO = 36_000;
const MAX_PAGINA = 200;
const MAX_UTM_CHAVES = 12;
const MAX_UTM_TEXTO = 300;

const RE_VIDEO = /^[a-z0-9_-]{1,64}$/;
/** `crypto.randomUUID()` ou outro id aleatório parecido. */
const RE_SESSAO = /^[A-Za-z0-9_-]{8,64}$/;
/** Só o pathname (já codificado pelo navegador): sem query, hash ou espaço. */
const RE_PAGINA = /^\/[A-Za-z0-9\-._~!$&'()*+,;=:@%/]*$/;

/* ------------------------------------------------------------------- helpers */

type Obj = Record<string, unknown>;

const ehObjeto = (v: unknown): v is Obj =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/** Tira caractere de controle e colapsa espaços (mesma regra do quiz). */
function limparTexto(s: string): string {
  return s.normalize('NFC').replace(/[\u0000-\u001f\u007f-\u009f]/g, ' ').replace(/\s+/g, ' ').trim();
}

function validarEvento(v: unknown): EventoValido | null {
  if (!ehObjeto(v)) return null;
  const { t, s, em } = v;
  if (typeof t !== 'string' || !Object.hasOwn(TIPOS, t)) return null;
  if (typeof s !== 'number' || !Number.isInteger(s) || s < 0 || s > MAX_SEGUNDO) return null;
  if (typeof em !== 'number' || !Number.isFinite(em)) return null;
  return { tipo: t as TipoEventoPlayer, segundo: s, em };
}

function validarUtm(bruto: unknown): LoteValido['utm'] {
  const utm: LoteValido['utm'] = {};
  if (!ehObjeto(bruto)) return utm;
  let n = 0;
  for (const [k, v] of Object.entries(bruto)) {
    if (n >= MAX_UTM_CHAVES) break;
    if (!/^[a-z][a-z0-9_]{0,39}$/.test(k) || typeof v !== 'string') continue;
    const s = limparTexto(v).slice(0, MAX_UTM_TEXTO);
    if (s) {
      utm[k] = s;
      n += 1;
    }
  }
  return utm;
}

/* ------------------------------------------------------------------ entrada */

export function validarLotePlayer(corpo: unknown): ResultadoValidacao {
  if (!ehObjeto(corpo)) return { ok: false, motivo: 'corpo_invalido' };

  const { video, sessao, pagina, eventos } = corpo;
  if (typeof video !== 'string' || !RE_VIDEO.test(video)) return { ok: false, motivo: 'video_invalido' };
  if (typeof sessao !== 'string' || !RE_SESSAO.test(sessao)) return { ok: false, motivo: 'sessao_invalida' };
  if (typeof pagina !== 'string' || pagina.length > MAX_PAGINA || !RE_PAGINA.test(pagina)) {
    return { ok: false, motivo: 'pagina_invalida' };
  }
  if (!Array.isArray(eventos) || eventos.length === 0) return { ok: false, motivo: 'sem_eventos' };
  if (eventos.length > MAX_EVENTOS) return { ok: false, motivo: 'eventos_demais' };

  const validos = eventos.map(validarEvento).filter((e): e is EventoValido => e !== null);
  if (validos.length === 0) return { ok: false, motivo: 'eventos_invalidos' };
  // `em` só serve para ordenar: as linhas entram na ordem em que aconteceram.
  validos.sort((a, b) => a.em - b.em);

  return {
    ok: true,
    descartados: eventos.length - validos.length,
    dados: { video, sessao, pagina, eventos: validos, utm: validarUtm(corpo.utm) },
  };
}
