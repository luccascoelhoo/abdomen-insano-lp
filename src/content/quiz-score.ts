import type { RespostasDoQuiz } from '@/lib/painel/respostas';

/**
 * Nota do lead do quiz, versão 1, por regras. Aprovada por Gabriel em 24/11/2026.
 *
 * Duas famílias de sinal:
 *  - comportamento, o que a pessoa FEZ (viu a oferta, clicou em comprar): é o
 *    sinal mais forte que existe antes da compra;
 *  - aderência, o que ela RESPONDEU e combina com quem o Desafio atende.
 *
 * Quando houver compradores suficientes vindos do quiz (8 ou mais), a nota por
 * semelhança com comprador (`lib/painel/score.ts`) passa a valer e esta vira a
 * segunda leitura. Mexer num peso aqui muda a nota de todo mundo na hora: o
 * painel calcula ao abrir, nada fica gravado.
 */
export type SinaisDoLead = {
  respostas: RespostasDoQuiz;
  aceiteEmail: boolean;
  viuOferta: boolean;
  clicouComprar: boolean;
};

export type Regra = { id: string; rotulo: string; pontos: number; bate: (l: SinaisDoLead) => boolean };

const tem = (v: string | string[] | undefined, alvo: string[]) =>
  Array.isArray(v) ? v.some((x) => alvo.includes(x)) : v !== undefined && alvo.includes(v);

export const REGRAS: Regra[] = [
  { id: 'oferta', rotulo: 'Viu a oferta', pontos: 20, bate: (l) => l.viuOferta },
  { id: 'checkout', rotulo: 'Clicou em comprar', pontos: 30, bate: (l) => l.clicouComprar },
  { id: 'aceite', rotulo: 'Aceitou receber e-mails', pontos: 10, bate: (l) => l.aceiteEmail },
  { id: 'idade', rotulo: 'Idade de 18 a 44', pontos: 10, bate: (l) => tem(l.respostas.faixaIdade, ['18-24', '25-34', '35-44']) },
  { id: 'academia', rotulo: 'Treina em academia', pontos: 10, bate: (l) => tem(l.respostas.local, ['full_gym', 'basic_gym']) },
  {
    id: 'dor',
    rotulo: 'Desistiu no meio ou não tinha plano',
    pontos: 10,
    bate: (l) => tem(l.respostas.impediu, ['desisti', 'plano']),
  },
  { id: 'confianca', rotulo: 'Acredita que consegue', pontos: 10, bate: (l) => tem(l.respostas.confianca, ['sim']) },
];

/** Cortes de faixa, os mesmos do painel de captação da casa. */
export const CORTES = { morno: 45, quente: 70 } as const;
