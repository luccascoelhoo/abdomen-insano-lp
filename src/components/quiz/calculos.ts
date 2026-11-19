/**
 * Contas do quiz sem React: rodam no navegador (telas) e no servidor
 * (e-mail do plano, lembretes). O estado (useQuiz) fica em motor.ts.
 */
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

/* ------------------------------------------------------- respostas válidas */

/**
 * Tira as respostas de telas que ficaram ocultas (`quando` falso) com as
 * respostas atuais. Sem isso, quem respondia "já tentei", marcava o que tentou
 * e depois voltava e trocava para "nunca tentei" levava as respostas velhas até
 * o diagnóstico, que afirmava coisas fora do caminho final da pessoa. Repete
 * até estabilizar, porque esconder uma tela pode esconder outra.
 */
export function semRespostasOcultas(telas: readonly Tela[], r: Respostas): Respostas {
  let atual = r;
  for (let volta = 0; volta < telas.length; volta++) {
    const ocultas = telas
      .filter((t) => 'chave' in t && t.quando && !t.quando(atual) && t.chave in atual)
      .map((t) => (t as { chave: string }).chave)
      .filter((k) => !telas.some((t) => 'chave' in t && t.chave === k && (!t.quando || t.quando(atual))));
    if (!ocultas.length) return atual;
    atual = { ...atual };
    for (const k of ocultas) delete atual[k];
  }
  return atual;
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
  /** Identificador interno (ordem e testes); não aparece na tela. */
  id: string;
  /** O hábito (ou crença) da pessoa, dito por ela nas respostas. */
  titulo: string;
  /** Por que isso esconde o abdômen (uma linha). */
  texto: string;
  /** O que o plano faz sobre isso (só o que o produto realmente entrega). */
  plano: string;
}

/** Quantos tipos de trava o quiz sabe reconhecer (o "M" de "N de M"). */
export const TOTAL_TRAVAS = 11;

/** "a", "a e b", "a, b e c". */
function juntar(itens: string[]): string {
  return itens.length < 2 ? (itens[0] ?? '') : `${itens.slice(0, -1).join(', ')} e ${itens[itens.length - 1]}`;
}

/**
 * Qual trava vira a principal, conforme a resposta de "O que mais te travou
 * até hoje?" (`obstaculo`): é a própria pessoa dizendo o que pesa mais, então
 * a tela não "descobre" uma trava que ela não reconhece como dela. Vai para o
 * topo a primeira desta lista que existir nas travas da pessoa.
 */
const PRINCIPAL_POR_OBSTACULO: Record<string, string[]> = {
  habits: ['calorias', 'belisca', 'pula', 'bebida'],
  time: ['tempo'],
  motivation: ['motivacao'],
  consistency: ['sanfona', 'plano'],
};

/**
 * Todas as travas que as respostas revelam, da principal para a menor. Cada
 * uma diz (1) o hábito, (2) por que atrapalha e (3) o que o plano faz,
 * usando só o que a página de vendas já promete: alimentação calculada pro
 * peso, rotina e gosto da pessoa; Guia Fim de Semana Sem Culpa; treino de
 * abdômen com sobrecarga progressiva; cardio calculado; app gamificado.
 * Nada de explicação hormonal, e nenhuma trava sem resposta do plano.
 *
 * Regra de ouro: o título só afirma o que a pessoa MARCOU. Antes, quem só
 * dizia que bebe no fim de semana lia "Bebida e petisco" como a sua principal
 * trava, sem ter marcado petisco nenhum (feedback de 19/11/2026).
 * `scripts/checar-caminhos.mjs` confere isso em milhares de combinações.
 */
export function todasAsTravas(r: Respostas): Trava[] {
  const lista = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]) : []);
  const habitos = lista(r.habitos);
  const impediu = lista(r.impediu);
  const refeicoes = typeof r.refeicoes === 'string' && r.refeicoes ? r.refeicoes : '';
  const t: Trava[] = [];

  // Os hábitos marcados em "Você tem algum destes hábitos?" vêm primeiro: é a
  // pessoa admitindo o hábito com as próprias palavras.
  const calorias = [
    habitos.includes('delivery') && 'delivery',
    habitos.includes('refri') && 'refrigerante',
    habitos.includes('doce') && 'doce',
  ].filter(Boolean) as string[];
  if (calorias.length)
    t.push({
      id: 'calorias',
      titulo: `Calorias de ${juntar(calorias)}`,
      texto: 'Somam rápido e passam despercebidas, então o déficit não fecha.',
      plano: habitos.includes('delivery')
        ? 'O plano alimentar usa o que você gosta de comer, e o Guia Fim de Semana Sem Culpa mostra como encaixar o delivery sem perder a semana.'
        : 'O plano alimentar é calculado com o que você gosta de comer, então não precisa cortar tudo de uma vez.',
    });

  if (habitos.includes('belisca'))
    t.push({
      id: 'belisca',
      titulo: 'Beliscar à noite',
      texto: 'O que escapa depois do jantar soma calorias sem você contar e segura o déficit.',
      plano: refeicoes
        ? `O plano alimentar define o que comer em cada uma das suas ${refeicoes} refeições, então a noite deixa de ser sem regra.`
        : 'O plano alimentar define o que comer em cada refeição, então a noite deixa de ser sem regra.',
    });

  if (habitos.includes('pula'))
    t.push({
      id: 'pula',
      titulo: 'Pular refeições',
      texto: 'Ficar horas sem comer abre a fome, e você acaba compensando depois sem perceber.',
      plano: refeicoes
        ? `O plano alimentar distribui a comida nas suas ${refeicoes} refeições, pra você não chegar morrendo de fome na próxima.`
        : 'O plano alimentar distribui a comida ao longo do dia, pra você não chegar morrendo de fome na próxima refeição.',
    });

  if (r.alcool === 'semana' || r.alcool === 'fds')
    t.push({
      id: 'bebida',
      titulo: r.alcool === 'semana' ? 'Bebida várias vezes na semana' : 'Bebida no fim de semana',
      texto:
        r.alcool === 'semana'
          ? 'Cada saída soma calorias que apagam o déficit dos outros dias.'
          : 'O que você bebe em 2 dias pode apagar o déficit dos outros 5.',
      plano: 'O Guia Fim de Semana Sem Culpa mostra como sair, beber e continuar dentro do déficit, sem cortar a cerveja.',
    });

  const planoSanfona =
    'O plano é calculado pro seu peso e a sua rotina, com o que você gosta de comer, pra você conseguir seguir os 42 dias.';
  if (r.dietaAntes === 'voltou')
    t.push({ id: 'sanfona', titulo: 'Peso que voltou depois da dieta', texto: 'Dieta radical que não dá pra manter faz o peso voltar.', plano: planoSanfona });
  else if (r.dietaAntes === 'fome' || impediu.includes('fome'))
    t.push({ id: 'sanfona', titulo: 'Dieta com fome que você largou', texto: 'Passar fome faz largar no meio, e o peso volta.', plano: planoSanfona });
  else if (impediu.includes('desisti'))
    t.push({
      id: 'sanfona',
      titulo: 'Começar e desistir no meio',
      texto: 'Um plano que não cabe na rotina costuma ser largado no meio do caminho.',
      plano: planoSanfona,
    });

  if (impediu.includes('plano'))
    t.push({
      id: 'plano',
      titulo: 'Treinar e comer sem um plano claro',
      texto: 'Sem saber o que fazer em cada dia, é fácil improvisar e perder o rumo.',
      plano: 'O app entrega a trilha de treinos, a alimentação simplificada e a sua evolução registrada, passo a passo.',
    });

  // "Falta de tempo" e "Falta de motivação" valem tanto marcadas em "O que te
  // impediu" quanto escolhidas em "O que mais te travou até hoje?".
  if (impediu.includes('tempo') || r.obstaculo === 'time')
    t.push({
      id: 'tempo',
      titulo: 'Falta de tempo',
      texto: 'Com a rotina corrida, o treino é o primeiro a cair.',
      plano: 'Dá resultado com treino de abdômen e cardio calculado só 2x por semana.',
    });

  if (impediu.includes('motivacao') || r.obstaculo === 'motivation')
    t.push({
      id: 'motivacao',
      titulo: 'Falta de motivação',
      texto: 'Sem resultado visível, a vontade some antes de o abdômen aparecer.',
      plano: 'O app é gamificado, mostra a sua evolução semana a semana e tem a Comunidade Anti Falhas te puxando nos dias difíceis.',
    });

  if (lista(r.jaTentou).includes('abdominal'))
    t.push({
      id: 'abdominal',
      titulo: 'Abdominal sem tirar a gordura',
      texto: 'Fortalece o músculo, mas não tira a capa de gordura que cobre ele.',
      plano: 'O desafio ataca as 2 frentes juntas: alimentação calculada pra tirar a capa e treino de abdômen com sobrecarga progressiva.',
    });

  if (r.rotina === 'sedentary')
    t.push({
      id: 'sentado',
      titulo: 'Dia inteiro sentado',
      texto: 'Você gasta pouca energia fora do treino, então a alimentação pesa ainda mais.',
      plano: 'O plano inclui cardio calculado, além do treino de abdômen.',
    });

  if (impediu.includes('genetica'))
    t.push({
      id: 'genetica',
      titulo: 'Achar que é genética',
      texto: 'A genética influencia o formato dos gomos, mas não decide sozinha se o abdômen aparece.',
      plano: 'O que faz o abdômen aparecer são as 2 frentes juntas: tirar a capa com o déficit certo e construir o músculo com treino.',
    });

  const preferida = (PRINCIPAL_POR_OBSTACULO[String(r.obstaculo)] ?? []).find((id) => t.some((x) => x.id === id));
  const i = preferida ? t.findIndex((x) => x.id === preferida) : -1;
  if (i > 0) t.unshift(...t.splice(i, 1));
  return t;
}

/** As 3 principais (e-mails do plano e dos lembretes). */
export function travas(r: Respostas): Trava[] {
  return todasAsTravas(r).slice(0, 3);
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

/** Ordem das opções da tela "O que você mais quer com o desafio?" (`content/quiz.ts`). */
const ORDEM_ASPIRACAO = ['body', 'healthy', 'energy', 'motivation'];

/**
 * A pergunta do objetivo é de múltipla escolha (`aspiracoes`), mas o app guarda
 * UMA `aspiration`: vai a primeira marcada, na ordem da tela. A lista inteira
 * segue nos extras. `aspiracao` (texto) é o formato antigo, de escolha única,
 * que ainda pode estar no progresso salvo de quem começou antes da mudança.
 */
function aspiracaoDoApp(r: Respostas): string | undefined {
  const marcadas = Array.isArray(r.aspiracoes)
    ? (r.aspiracoes as string[])
    : typeof r.aspiracao === 'string'
      ? [r.aspiracao]
      : [];
  return ORDEM_ASPIRACAO.find((v) => marcadas.includes(v));
}

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
  ];
  for (const [quiz, campo] of diretos) if (s(quiz)) app[campo] = s(quiz)!;
  const aspiracao = aspiracaoDoApp(r);
  if (aspiracao) app.aspiration = aspiracao;
  if (s('experiencia')) app.training_level = NIVEL_TREINO[s('experiencia')!] ?? 'beginner';
  app.discovery_source = origemDoApp(utm.utm_source);
  return app;
}

/**
 * Chaves que já viram campo do app (o resto vai em `extras`). `aspiracoes`
 * fica de fora de propósito: o app só guarda uma, então a lista inteira vai
 * nos extras. `aspiracao` é o formato antigo (já está no `app`).
 */
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

/* --------------------------------------------------------------- barra de progresso */

/**
 * Barra "persuasiva", a mesma ideia da barra falsa do player de vídeo: corre
 * rápido no começo e desacelera no fim, para a pessoa sentir que já avançou
 * muito e que falta pouco. `p` é o progresso real (0 a 1); o resultado também
 * vai de 0 a 1 e chega a 1 junto com o fim do quiz.
 *
 * mostrado = 1 - (1 - p)^alpha  (alpha 2 = o do VTurb; 1 = barra real)
 */
export function progressoPersuasivo(p: number, alpha = 2): number {
  const x = Math.min(1, Math.max(0, p));
  return 1 - Math.pow(1 - x, alpha);
}
