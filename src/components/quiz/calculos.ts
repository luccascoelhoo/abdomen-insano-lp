/**
 * Contas do quiz sem React: rodam no navegador (telas) e no servidor
 * (e-mail do plano, lembretes). O estado (useQuiz) fica em motor.ts.
 */
import type { NivelCapa, PayloadQuiz, Projecao, Respostas, Texto } from './tipos';

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
/**
 * Quando a pessoa chega na meta no ritmo da projeção (como a tela "Você chega
 * lá" do app). Null se não há perda de peso a fazer.
 */
export function chegadaNaMeta(r: Respostas, hoje = new Date()): { semanas: number; texto: string; quando: string } | null {
  const p = projecao(r);
  if (!p || p.ritmoKg <= 0 || p.pesoMeta >= p.pesoAtual) return null;
  const semanas = Math.max(1, Math.ceil((p.pesoAtual - p.pesoMeta) / p.ritmoKg));
  const meses = Math.floor(semanas / 4.345);
  const resto = Math.round(semanas - meses * 4.345);
  const s = (n: number) => (n === 1 ? '1 semana' : `${n} semanas`);
  const m = (n: number) => (n === 1 ? '1 mês' : `${n} meses`);
  const texto = semanas < 8 ? s(semanas) : resto > 0 ? `${m(meses)} e ${s(resto)}` : m(meses);
  const data = new Date(hoje.getTime() + semanas * 7 * 86_400_000);
  const quando = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric', timeZone: 'America/Sao_Paulo' }).format(data);
  return { semanas, texto, quando };
}

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

/* ------------------------------------------------------------------ travas */

export interface Trava {
  titulo: string;
  texto: string;
}

/**
 * "O que está segurando o seu abdômen": até 3 travas tiradas das respostas.
 * Só comportamento (sono, beliscar, bebida, dieta radical…), nada de
 * explicação hormonal duvidosa. A ordem é a de impacto no déficit.
 */
export function travas(r: Respostas): Trava[] {
  const lista = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]) : []);
  const habitos = lista(r.habitos);
  const t: Trava[] = [];
  if (r.alcool === 'semana' || r.alcool === 'fds')
    t.push({
      titulo: 'Bebida e petisco no fim de semana',
      texto: 'As calorias de 2 dias podem apagar o déficit dos outros 5. Dá pra beber, com estratégia.',
    });
  if (habitos.includes('belisca'))
    t.push({ titulo: 'Beliscar à noite', texto: 'O que escapa depois do jantar é o que mais segura o déficit sem você perceber.' });
  if (habitos.includes('delivery') || habitos.includes('refri') || habitos.includes('doce'))
    t.push({ titulo: 'Calorias que não matam a fome', texto: 'Refrigerante, doce e delivery somam muito e deixam você com fome do mesmo jeito.' });
  if (r.dietaAntes === 'voltou' || r.dietaAntes === 'fome')
    t.push({ titulo: 'Efeito sanfona', texto: 'Dieta radical que não dá pra manter faz o peso voltar. O plano precisa caber na sua vida.' });
  if (r.sono === 'lt5' || r.sono === '5-6')
    t.push({ titulo: 'Sono curto', texto: 'Dormir pouco aumenta a fome no dia seguinte e atrapalha a recuperação do treino.' });
  if (lista(r.jaTentou).includes('abdominal'))
    t.push({ titulo: 'Só abdominal', texto: 'Fortalece o músculo, mas não tira a capa de gordura que cobre ele.' });
  if (r.rotina === 'sedentary')
    t.push({ titulo: 'Dia inteiro sentado', texto: 'Gasta pouca energia fora do treino, então a alimentação pesa ainda mais.' });
  return t.slice(0, 3);
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

