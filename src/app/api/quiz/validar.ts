/**
 * Validação do corpo que o quiz (`/quiz`) manda para `/api/quiz`.
 *
 * Escrita à mão (sem dependência nova) e sem import nenhum: o script
 * `scripts/checar-quiz.mjs` carrega este arquivo direto no Node para conferir
 * que o `cadastroDoApp` do motor só produz o que esta lista aceita.
 *
 * Regra geral:
 *  - `email` e `nome` inválidos recusam o corpo inteiro (sem eles não há lead);
 *  - em `app`, chave fora da lista é descartada, e valor fora da faixa também
 *    (só aquela chave: o resto do cadastro continua valendo);
 *  - `extras` e `utm` têm teto de chaves e de tamanho, e o que passa disso cai.
 *
 * As listas de `app` são as do cadastro do app (Flammer): os valores das telas
 * em `PassosDoCorpo.kt`, `PassosDeTreino.kt`, `PassosDeDieta.kt` e
 * `PassosDeFechamento.kt`, o metadata de `MotorDeCadastro.prepareSignupMetadata`
 * e as CHECK de `public.profiles` (`supabase/schema.sql`). Mudou lá, muda aqui.
 */

export interface CorpoQuizValido {
  email: string;
  nome: string;
  aceiteEmail: boolean;
  app: Record<string, string | number | string[]>;
  extras: Record<string, string | number | boolean | string[]>;
  utm: Record<string, string>;
  /** Sessão do funil por tela (`quiz_eventos.sessao`): liga o lead à jornada dele. */
  sessao: string | null;
  /** Marcado no navegador por `?teste=1`. A lista do time é aplicada no servidor. */
  teste: boolean;
}

export type ResultadoValidacao =
  | { ok: true; isca: boolean; dados: CorpoQuizValido; descartados: string[] }
  | { ok: false; motivo: string };

/* ------------------------------------------------------------- listas do app */

const ENUMS_DO_APP: Record<string, readonly string[]> = {
  gender: ['male', 'female'],
  goal: ['lose', 'gain', 'maintain'],
  training_experience: ['none', 'lt6m', '6m2y', 'gt2y'],
  training_level: ['beginner', 'intermediate', 'advanced'],
  training_frequency: ['0-2', '3-5', '6+'],
  workout_place: ['full_gym', 'basic_gym', 'home'],
  session_time: ['30_45', '60', '90_plus'],
  cardio_preference: ['post_15', 'session_30_45', 'separate_days', 'none'],
  daily_routine: ['sedentary', 'active', 'heavy'],
  meals_count: ['3', '4', '5', '6'],
  biggest_obstacle: ['consistency', 'habits', 'time', 'motivation'],
  aspiration: ['healthy', 'energy', 'motivation', 'body'],
  discovery_source: ['instagram', 'tiktok', 'youtube', 'google', 'indicacao', 'appstore', 'outro'],
};

/** Faixas numéricas (inclusivas). As mesmas réguas do app e das CHECK. */
const FAIXAS_DO_APP: Record<string, readonly [number, number]> = {
  height: [120, 220],
  weight: [35, 200],
  desired_weight: [35, 200],
  weekly_pace_kg: [0.05, 1],
};

/** `FOCUS_LIST` de `PassosDeTreino.kt`, grafia exata (NFC). */
const FOCOS_DO_APP = [
  'Corpo Equilibrado',
  'Peitoral e Braços',
  'Costas',
  'Ombros',
  'Glúteos e Pernas',
  'Abdômen',
] as const;

/** Toda chave que `app` pode ter. O resto é descartado. */
export const CHAVES_APP_PERMITIDAS: ReadonlySet<string> = new Set([
  ...Object.keys(ENUMS_DO_APP),
  ...Object.keys(FAIXAS_DO_APP),
  'name',
  'birth_year',
  'birth_month',
  'birth_day',
  'workout_focus',
]);

/** O app exige 18 anos (`PassosDoCorpo.kt`). 100 é teto de sanidade. */
const IDADE_MINIMA = 18;
const IDADE_MAXIMA = 100;
/** `TextoLivre.MAX_NOME` do app. */
const MAX_NOME_APP = 50;

/* ------------------------------------------------------------------- limites */

const MAX_EMAIL = 254;
const MAX_LOCAL_EMAIL = 64;
const MIN_NOME = 2;
const MAX_NOME = 80;
const MAX_EXTRAS_CHAVES = 40;
const MAX_EXTRAS_TEXTO = 200;
const MAX_EXTRAS_LISTA = 20;
const MAX_EXTRAS_BYTES = 4096;
const MAX_UTM_CHAVES = 12;
const MAX_UTM_TEXTO = 300;
const CHAVE_LIVRE = /^[A-Za-z][A-Za-z0-9_]{0,39}$/;

/* ------------------------------------------------------------------- helpers */

type Obj = Record<string, unknown>;

const ehObjeto = (v: unknown): v is Obj =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/** Tira caractere de controle e colapsa espaços. */
function limparTexto(s: string): string {
  return s.normalize('NFC').replace(/[\u0000-\u001f\u007f-\u009f]/g, ' ').replace(/\s+/g, ' ').trim();
}

export function emailValido(email: string): boolean {
  if (email.length > MAX_EMAIL) return false;
  const m = /^([^\s@]+)@([^\s@]+\.[^\s@]+)$/.exec(email);
  if (!m || m[1].length > MAX_LOCAL_EMAIL) return false;
  // Domínio: rótulos de letras, dígitos e hífen, sem ponto duplo.
  return /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(m[2]);
}

/**
 * O nome como o app grava (`TextoLivre.nomeFinal`): letras, dígitos, marcas,
 * apóstrofo e hífen; espaço colapsado; corta em 50. Precisa de 2+ caracteres
 * e de uma letra (`TextoLivre.nomeValido`).
 */
function nomeDoApp(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const n = v
    .normalize('NFC')
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[‐‑]/g, '-')
    .replace(/[^\p{L}\p{N}\p{M}'\-\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
  const cortado = Array.from(n).slice(0, MAX_NOME_APP).join('').trim();
  return cortado.length >= 2 && /\p{L}/u.test(cortado) ? cortado : null;
}

function inteiro(v: unknown): number | null {
  return typeof v === 'number' && Number.isInteger(v) ? v : null;
}

/** Data real (31/02 não passa) e idade entre 18 e 100 no fuso do produto. */
export function nascimentoValido(ano: number, mes: number, dia: number, hoje = new Date()): boolean {
  if (mes < 1 || mes > 12 || dia < 1 || dia > 31) return false;
  const d = new Date(Date.UTC(ano, mes - 1, dia));
  if (d.getUTCFullYear() !== ano || d.getUTCMonth() !== mes - 1 || d.getUTCDate() !== dia) return false;
  // Data de negócio em America/Sao_Paulo, como o app (`FUSO_DO_PRODUTO`).
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(hoje);
  const [ha, hm, hd] = partes.split('-').map(Number);
  let idade = ha - ano;
  if (hm < mes || (hm === mes && hd < dia)) idade -= 1;
  return idade >= IDADE_MINIMA && idade <= IDADE_MAXIMA;
}

/* ------------------------------------------------------------------ partes */

function validarApp(bruto: unknown, descartados: string[]): CorpoQuizValido['app'] {
  const app: CorpoQuizValido['app'] = {};
  if (!ehObjeto(bruto)) return app;

  for (const [k, v] of Object.entries(bruto)) {
    if (!CHAVES_APP_PERMITIDAS.has(k)) {
      descartados.push(`app.${k}`);
      continue;
    }
    if (k in ENUMS_DO_APP) {
      if (typeof v === 'string' && ENUMS_DO_APP[k].includes(v)) app[k] = v;
      else descartados.push(`app.${k}`);
    } else if (k in FAIXAS_DO_APP) {
      const [min, max] = FAIXAS_DO_APP[k];
      if (typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max) {
        app[k] = Math.round(v * 100) / 100;
      } else descartados.push(`app.${k}`);
    } else if (k === 'name') {
      const n = nomeDoApp(v);
      if (n) app.name = n;
      else descartados.push('app.name');
    } else if (k === 'workout_focus') {
      const lista: unknown[] = Array.isArray(v) ? v : [];
      const validos = lista
        .map((f) => (typeof f === 'string' ? f.normalize('NFC') : ''))
        .filter((f) => (FOCOS_DO_APP as readonly string[]).includes(f));
      // Lista inteira ou nada: um foco desconhecido é sinal de payload torto.
      const focos = [...new Set(validos)];
      // "Corpo Equilibrado" é exclusivo no app (desmarca os outros).
      const exclusivoMisturado = focos.includes('Corpo Equilibrado') && focos.length > 1;
      if (focos.length > 0 && validos.length === lista.length && !exclusivoMisturado) app.workout_focus = focos;
      else descartados.push('app.workout_focus');
    }
    // birth_* são validados juntos, abaixo.
  }

  // Data de nascimento: as três partes juntas ou nenhuma.
  const [a, m, d] = [inteiro(bruto.birth_year), inteiro(bruto.birth_month), inteiro(bruto.birth_day)];
  const algumaData = 'birth_year' in bruto || 'birth_month' in bruto || 'birth_day' in bruto;
  if (a !== null && m !== null && d !== null && nascimentoValido(a, m, d)) {
    app.birth_year = a;
    app.birth_month = m;
    app.birth_day = d;
  } else if (algumaData) {
    descartados.push('app.birth_*');
  }

  // Coerência mínima: training_level é derivado da experiência no app.
  if (app.training_experience && app.training_level) {
    const esperado = { gt2y: 'advanced', '6m2y': 'intermediate' }[app.training_experience as string] ?? 'beginner';
    if (app.training_level !== esperado) {
      delete app.training_level;
      descartados.push('app.training_level');
    }
  }
  // Ritmo só existe para quem vai mudar de peso (no app, `null` em "maintain").
  if (app.weekly_pace_kg !== undefined && app.goal === 'maintain') {
    delete app.weekly_pace_kg;
    descartados.push('app.weekly_pace_kg');
  }
  return app;
}

function validarExtras(bruto: unknown, descartados: string[]): CorpoQuizValido['extras'] {
  const extras: CorpoQuizValido['extras'] = {};
  if (!ehObjeto(bruto)) return extras;
  let n = 0;
  for (const [k, v] of Object.entries(bruto)) {
    if (n >= MAX_EXTRAS_CHAVES || !CHAVE_LIVRE.test(k)) {
      descartados.push(`extras.${k.slice(0, 40)}`);
      continue;
    }
    if (typeof v === 'string') extras[k] = limparTexto(v).slice(0, MAX_EXTRAS_TEXTO);
    else if (typeof v === 'boolean') extras[k] = v;
    else if (typeof v === 'number' && Number.isFinite(v)) extras[k] = v;
    else if (Array.isArray(v) && v.every((x) => typeof x === 'string')) {
      extras[k] = (v as string[]).slice(0, MAX_EXTRAS_LISTA).map((x) => limparTexto(x).slice(0, 100));
    } else {
      descartados.push(`extras.${k}`);
      continue;
    }
    n += 1;
  }
  // Teto de bytes no conjunto: se ainda estourar, guarda vazio em vez de cortar no meio.
  if (JSON.stringify(extras).length > MAX_EXTRAS_BYTES) {
    descartados.push('extras');
    return {};
  }
  return extras;
}

function validarUtm(bruto: unknown, descartados: string[]): CorpoQuizValido['utm'] {
  const utm: CorpoQuizValido['utm'] = {};
  if (!ehObjeto(bruto)) return utm;
  let n = 0;
  for (const [k, v] of Object.entries(bruto)) {
    if (n >= MAX_UTM_CHAVES || !/^[a-z][a-z0-9_]{0,39}$/.test(k) || typeof v !== 'string') {
      descartados.push(`utm.${k.slice(0, 40)}`);
      continue;
    }
    const s = limparTexto(v).slice(0, MAX_UTM_TEXTO);
    if (s) {
      utm[k] = s;
      n += 1;
    }
  }
  return utm;
}

/* ------------------------------------------------------------------ entrada */

export function validarCorpoQuiz(corpo: unknown): ResultadoValidacao {
  if (!ehObjeto(corpo)) return { ok: false, motivo: 'corpo_invalido' };

  // Campo-isca: gente não vê o campo, robô preenche. Responde igual a sucesso.
  const isca = typeof corpo.site === 'string' ? corpo.site.trim() !== '' : corpo.site != null;

  const email = typeof corpo.email === 'string' ? corpo.email.trim().toLowerCase() : '';
  if (!emailValido(email)) return { ok: false, motivo: 'email_invalido' };

  const nome = typeof corpo.nome === 'string' ? limparTexto(corpo.nome) : '';
  const tamNome = Array.from(nome).length;
  if (tamNome < MIN_NOME || tamNome > MAX_NOME) return { ok: false, motivo: 'nome_invalido' };

  const descartados: string[] = [];
  return {
    ok: true,
    isca,
    descartados,
    dados: {
      email,
      nome,
      aceiteEmail: corpo.aceiteEmail === true,
      app: validarApp(corpo.app, descartados),
      extras: validarExtras(corpo.extras, descartados),
      utm: validarUtm(corpo.utm, descartados),
      sessao:
        typeof corpo.sessao === 'string' && /^[A-Za-z0-9-]{8,64}$/.test(corpo.sessao) ? corpo.sessao : null,
      teste: corpo.teste === true,
    },
  };
}
