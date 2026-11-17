'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { NivelCapa, PayloadQuiz, Projecao, Respostas, Tela, Texto } from './tipos';

/* ------------------------------------------------------------------ texto */

export function texto(t: Texto | undefined, r: Respostas): string {
  if (t === undefined) return '';
  return typeof t === 'function' ? t(r) : t;
}

/** Primeiro nome, com a inicial maiúscula ("joão pedro" → "João"). */
export function primeiroNome(r: Respostas): string {
  const n = String(r.nome ?? '').trim().split(/\s+/)[0] ?? '';
  return n ? n[0].toUpperCase() + n.slice(1).toLowerCase() : '';
}

/* ---------------------------------------------------------------- cálculos */

const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);

export function imc(r: Respostas): number | null {
  const a = num(r.altura);
  const p = num(r.peso);
  if (!a || !p) return null;
  return Math.round((p / (a / 100) ** 2) * 10) / 10;
}

/**
 * Nível da capa de gordura. Antes dos números (tela 7) só existe a foto do
 * físico; depois, o IMC ajusta um degrau quando discorda muito da foto.
 */
/** Nível só pela foto do físico (o que a tela "capa" mostra, antes dos números). */
export function nivelPelaFoto(r: Respostas): NivelCapa {
  return nivelDaCapa({ fisico: r.fisico });
}

export function nivelDaCapa(r: Respostas): NivelCapa {
  const niveis: NivelCapa[] = ['fina', 'media', 'grossa', 'muito-grossa'];
  let i = Math.max(0, niveis.indexOf(String(r.fisico ?? 'media') as NivelCapa));
  if (i < 0) i = 1;
  const b = imc(r);
  if (b !== null) {
    const pelaConta = b < 23 ? 0 : b < 27 ? 1 : b < 31 ? 2 : 3;
    if (pelaConta > i + 1) i += 1;
    if (pelaConta < i - 1) i -= 1;
  }
  return niveis[i];
}

/**
 * Projeção conservadora de 42 dias: 0,5% a 0,8% do peso por semana conforme a
 * capa, sem passar da meta. É estimativa e a tela diz isso.
 */
export function projecao(r: Respostas): Projecao | null {
  const p = num(r.peso);
  const meta = num(r.pesoDesejado);
  if (!p || !meta) return null;
  const taxa = { fina: 0.005, media: 0.006, grossa: 0.007, 'muito-grossa': 0.008 }[nivelDaCapa(r)];
  const perde = meta < p;
  // Teto de 0,5 kg/semana: o mesmo que o app prescreve (weekly_pace_kg).
  const ritmoKg = perde ? Math.min(0.5, Math.round(p * taxa * 10) / 10) : 0;
  const semanas = Array.from({ length: 7 }, (_, s) => ({
    semana: s,
    peso: perde ? Math.max(meta, Math.round((p - ritmoKg * s) * 10) / 10) : p,
  }));
  return { pesoAtual: p, pesoMeta: meta, peso42: semanas[6].peso, semanas, ritmoKg };
}

/** Idade na data de hoje em Brasília (o mesmo fuso que a API usa para validar). */
/** Dias inteiros de hoje (Brasília) até 'AAAA-MM-DD'. Null se inválida. */
export function diasAte(data: string | undefined, hoje = new Date()): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(data ?? '');
  if (!m) return null;
  const hojeSP = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(hoje);
  const ms = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])) - Date.parse(`${hojeSP}T00:00:00Z`);
  return Math.round(ms / 86_400_000);
}

/**
 * Estimativa até a data do evento, no mesmo ritmo conservador da projeção
 * (≤ 0,5 kg/semana) e sem passar da meta. Null sem data ou sem números.
 */
export function ateOEvento(r: Respostas): { dias: number; semanas: number; peso: number } | null {
  const dias = diasAte(typeof r.dataEvento === 'string' ? r.dataEvento : undefined);
  const p = projecao(r);
  if (dias === null || dias < 1 || !p) return null;
  const semanas = dias / 7;
  const peso = Math.max(p.pesoMeta, Math.round((p.pesoAtual - p.ritmoKg * semanas) * 10) / 10);
  return { dias, semanas: Math.floor(semanas), peso };
}

export function idade(nascimento: string | undefined, hoje = new Date()): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(nascimento ?? '');
  if (!m) return null;
  const [a, me, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const [ha, hm, hd] = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' })
    .format(hoje)
    .split('-')
    .map(Number);
  let i = ha - a;
  if (hm < me || (hm === me && hd < d)) i -= 1;
  return i;
}

/* ------------------------------------------------- ponte para o cadastro do app */

/** Origem do anúncio → `discovery_source` do app. */
function origemDoApp(utmSource: string | undefined): string {
  const s = (utmSource ?? '').toLowerCase();
  if (/(^|\b)(ig|instagram|fb|facebook|meta)/.test(s)) return 'instagram';
  if (s.includes('tiktok')) return 'tiktok';
  if (s.includes('youtube') || s === 'yt') return 'youtube';
  if (s.includes('google')) return 'google';
  return 'outro';
}

const NIVEL_TREINO: Record<string, string> = {
  none: 'beginner',
  lt6m: 'beginner',
  '6m2y': 'intermediate',
  gt2y: 'advanced',
};

/**
 * Converte as respostas no `user_metadata` do cadastro do app (Flammer,
 * `MotorDeCadastro.kt`): mesmos nomes e valores. Só entra o que foi respondido.
 */
export function cadastroDoApp(r: Respostas, utm: Record<string, string>): PayloadQuiz['app'] {
  const app: PayloadQuiz['app'] = { gender: 'male', workout_focus: ['Abdômen'] };
  const s = (k: string) => (typeof r[k] === 'string' && r[k] ? (r[k] as string) : undefined);
  const n = (k: string) => num(r[k]) ?? undefined;

  if (s('nome')) app.name = String(r.nome).trim();
  const nasc = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s('nascimento') ?? '');
  if (nasc) {
    app.birth_year = Number(nasc[1]);
    app.birth_month = Number(nasc[2]);
    app.birth_day = Number(nasc[3]);
  }
  if (n('altura')) app.height = n('altura')!;
  if (n('peso')) app.weight = n('peso')!;
  if (n('pesoDesejado')) app.desired_weight = n('pesoDesejado')!;
  if (n('peso') && n('pesoDesejado')) {
    // Mesma conta do app (`ReguasCaloricas.objetivoPelaMeta`): |d| < 0,5 mantém.
    const d = n('pesoDesejado')! - n('peso')!;
    app.goal = Math.abs(d) < 0.5 ? 'maintain' : d < 0 ? 'lose' : 'gain';
  }
  // Ritmo só para quem vai perder, e nunca acima do teto seguro de perda do app
  // (`RitmoEfetivo.TETO_DE_PERDA` = 0,5): o `weekly_pace_kg` alimenta a dieta.
  const pr = projecao(r);
  if (app.goal === 'lose' && pr && pr.ritmoKg > 0) {
    app.weekly_pace_kg = Math.min(0.5, Math.max(0.05, pr.ritmoKg));
  }

  const diretos: [string, string][] = [
    ['experiencia', 'training_experience'],
    ['frequencia', 'training_frequency'],
    ['local', 'workout_place'],
    ['tempoTreino', 'session_time'],
    ['cardio', 'cardio_preference'],
    ['rotina', 'daily_routine'],
    ['refeicoes', 'meals_count'],
    ['obstaculo', 'biggest_obstacle'],
    ['aspiracao', 'aspiration'],
  ];
  for (const [quiz, campo] of diretos) if (s(quiz)) app[campo] = s(quiz)!;
  if (s('experiencia')) app.training_level = NIVEL_TREINO[s('experiencia')!] ?? 'beginner';
  app.discovery_source = origemDoApp(utm.utm_source);
  return app;
}

/** Chaves que já viram campo do app (o resto vai em `extras`). */
const CHAVES_DO_APP = new Set([
  'nome', 'email', 'aceiteEmail', 'nascimento', 'altura', 'peso', 'pesoDesejado',
  'experiencia', 'frequencia', 'local', 'tempoTreino', 'cardio', 'rotina', 'refeicoes',
  'obstaculo', 'aspiracao',
]);

export function montarPayload(r: Respostas, utm: Record<string, string>, site = ''): PayloadQuiz {
  const extras: PayloadQuiz['extras'] = {};
  for (const [k, v] of Object.entries(r)) if (!CHAVES_DO_APP.has(k) && v !== undefined) extras[k] = v;
  return {
    email: String(r.email ?? '').trim().toLowerCase(),
    nome: String(r.nome ?? '').trim(),
    aceiteEmail: r.aceiteEmail === true,
    app: cadastroDoApp(r, utm),
    extras,
    utm,
    site,
  };
}

/* ------------------------------------------------------------------ estado */

/**
 * O progresso salvo guarda o índice da tela: ao mudar a ordem ou a quantidade
 * de telas em `content/quiz.ts`, suba a versão para ninguém voltar na tela errada.
 */
export const VERSAO_QUIZ = 3;
const CHAVE_LOCAL = `ai_quiz_v${VERSAO_QUIZ}`;
/** Toques mais próximos que isso viram um só (toque duplo pulava telas). */
const TRAVA_MS = 400;

interface Salvo {
  i: number;
  r: Respostas;
}

/**
 * Estado do quiz: índice da tela + respostas, salvos no navegador para quem
 * sair continuar de onde parou. Telas com `quando` falso são puladas.
 */
export function useQuiz(telas: Tela[]) {
  const [i, setI] = useState(0);
  const [r, setR] = useState<Respostas>({});
  const [pronto, setPronto] = useState(false);
  // Respostas mais recentes fora do ciclo de render: `responder` grava e
  // avança na mesma chamada sem efeito colateral dentro do updater do React.
  const rRef = useRef<Respostas>({});
  const ultimaTroca = useRef(0);
  const podeTrocar = () => {
    const agora = Date.now();
    if (agora - ultimaTroca.current < TRAVA_MS) return false;
    ultimaTroca.current = agora;
    return true;
  };

  // Lê o progresso salvo só no navegador, depois da hidratação (o servidor não
  // tem localStorage; ler no useState inicial quebraria a hidratação).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(CHAVE_LOCAL) ?? 'null') as Salvo | null;
      if (s && typeof s.i === 'number' && s.r) {
        setI(Math.min(s.i, telas.length - 1));
        rRef.current = s.r;
        setR(s.r);
      }
    } catch {}
    setPronto(true);
  }, [telas.length]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!pronto) return;
    try {
      localStorage.setItem(CHAVE_LOCAL, JSON.stringify({ i, r } satisfies Salvo));
    } catch {}
  }, [i, r, pronto]);

  const visivel = useCallback((idx: number, resp: Respostas) => {
    const t = telas[idx];
    return !!t && (!t.quando || t.quando(resp));
  }, [telas]);

  const proxima = useCallback((de: number, resp: Respostas, passo: 1 | -1) => {
    let n = de + passo;
    while (n >= 0 && n < telas.length && !visivel(n, resp)) n += passo;
    return Math.max(0, Math.min(telas.length - 1, n));
  }, [telas.length, visivel]);


  const responder = useCallback((valores: Respostas, op?: { avancar?: boolean }) => {
    const avanca = op?.avancar !== false;
    if (avanca && !podeTrocar()) return;
    const novo = { ...rRef.current, ...valores };
    rRef.current = novo;
    setR(novo);
    if (avanca) setI((idx) => proxima(idx, novo, 1));
  }, [proxima]);

  const avancar = useCallback(() => {
    if (podeTrocar()) setI((idx) => proxima(idx, rRef.current, 1));
  }, [proxima]);
  const voltar = useCallback(() => {
    if (podeTrocar()) setI((idx) => proxima(idx, rRef.current, -1));
  }, [proxima]);
  const irPara = useCallback((k: Tela['k']) => {
    const idx = telas.findIndex((t) => t.k === k);
    if (idx >= 0) setI(idx);
  }, [telas]);
  const recomecar = useCallback(() => {
    rRef.current = {};
    setR({});
    setI(0);
  }, []);

  /** Progresso 0–1 dentro das telas visíveis. */
  const progresso = useMemo(() => {
    const vis = telas.map((_, idx) => idx).filter((idx) => visivel(idx, r));
    const pos = vis.indexOf(i);
    return vis.length > 1 ? Math.max(0, pos) / (vis.length - 1) : 0;
  }, [telas, visivel, r, i]);

  return { i, tela: telas[i], respostas: r, responder, avancar, voltar, irPara, recomecar, progresso, pronto };
}
