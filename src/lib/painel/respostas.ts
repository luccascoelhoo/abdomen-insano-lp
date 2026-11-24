import { telasQuiz } from '@/content/quiz';

/**
 * As respostas do quiz como a pessoa deu, a partir da linha gravada.
 *
 * O envio separa as respostas em dois lugares (`components/quiz/calculos.ts`):
 * o que vira campo do app vai em `app`, com outro nome, e o resto em `extras`.
 * O painel junta de volta pela chave do quiz, que é a mesma das telas: assim
 * o rótulo de cada opção sai de `content/quiz.ts`, e mudar o texto de uma
 * opção lá muda aqui sem ninguém lembrar.
 */
const DO_APP: [string, string][] = [
  ['experiencia', 'training_experience'],
  ['frequencia', 'training_frequency'],
  ['local', 'workout_place'],
  ['tempoTreino', 'session_time'],
  ['cardio', 'cardio_preference'],
  ['rotina', 'daily_routine'],
  ['refeicoes', 'meals_count'],
  ['obstaculo', 'biggest_obstacle'],
];

export type Resposta = string | string[];
export type RespostasDoQuiz = Record<string, Resposta>;

export function respostasDaLinha(l: { app: Record<string, unknown> | null; extras: Record<string, unknown> | null }): RespostasDoQuiz {
  const r: RespostasDoQuiz = {};
  for (const [k, v] of Object.entries(l.extras ?? {})) {
    if (Array.isArray(v)) r[k] = v.map(String);
    else if (typeof v === 'string' || typeof v === 'number') r[k] = String(v);
  }
  for (const [quiz, campo] of DO_APP) {
    const v = (l.app ?? {})[campo];
    if (r[quiz] === undefined && (typeof v === 'string' || typeof v === 'number')) r[quiz] = String(v);
  }
  return r;
}

/** Os blocos do quiz, com os nomes de `content/quiz.ts`. */
export const BLOCOS: Record<number, string> = {
  1: 'Seu corpo',
  2: 'Seu histórico',
  3: 'Seu treino',
  4: 'Rotina e alimentação',
  5: 'Seus números e metas',
  6: 'Seu plano',
};

export type Pergunta = {
  chave: string;
  bloco: number;
  /** Título da tela, sem a marcação de negrito. */
  titulo: string;
  multipla: boolean;
  /** Id da opção → texto que a pessoa viu. */
  opcoes: Record<string, string>;
};

const semMarcacao = (s: string) => s.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();

/** As perguntas de opção do quiz, na ordem em que aparecem. */
export const PERGUNTAS: Pergunta[] = telasQuiz.flatMap((t) => {
  if (!('chave' in t) || !t.chave || !('opcoes' in t) || !Array.isArray(t.opcoes)) return [];
  const chave = String(t.chave);
  const titulo = 'pergunta' in t && typeof t.pergunta === 'string' ? t.pergunta : 'titulo' in t ? String(t.titulo) : chave;
  return [
    {
      chave,
      bloco: 'bloco' in t && typeof t.bloco === 'number' ? t.bloco : 0,
      titulo: semMarcacao(titulo),
      multipla: t.k === 'multi',
      opcoes: Object.fromEntries(t.opcoes.map((o) => [o.v, semMarcacao(o.rotulo)])),
    },
  ];
});

const POR_CHAVE = new Map(PERGUNTAS.map((p) => [p.chave, p]));

export const rotuloDaOpcao = (chave: string, v: string): string => POR_CHAVE.get(chave)?.opcoes[v] ?? v;
export const tituloDaPergunta = (chave: string): string => POR_CHAVE.get(chave)?.titulo ?? chave;
