import { CORTES, REGRAS, type SinaisDoLead } from '@/content/quiz-score';
import { PERGUNTAS, type RespostasDoQuiz } from './respostas';

export type Faixa = 'quente' | 'morno' | 'frio';

export const faixaDe = (nota: number): Faixa => (nota >= CORTES.quente ? 'quente' : nota >= CORTES.morno ? 'morno' : 'frio');

export type NotaPorRegras = { nota: number; itens: { rotulo: string; pontos: number; bateu: boolean }[] };

/** Soma das regras que bateram, com teto de 100, e o detalhe de cada uma para a gaveta do lead. */
export function notaPorRegras(l: SinaisDoLead): NotaPorRegras {
  const itens = REGRAS.map((r) => ({ rotulo: r.rotulo, pontos: r.pontos, bateu: r.bate(l) }));
  const nota = Math.min(100, itens.reduce((s, i) => s + (i.bateu ? i.pontos : 0), 0));
  return { nota, itens };
}

/* ------------------------------------------------ semelhança com comprador */

/**
 * Quanto as respostas do lead se parecem com as de quem comprou.
 *
 * Porte sem mudança de matemática do score de semelhança da casa:
 *  - por pergunta, a distribuição das respostas dos compradores (P_B) contra a
 *    de todos os leads (P_G), as duas suavizadas por Laplace (α = 1);
 *  - o sinal de cada resposta é ln(P_B / P_G), com teto de ±ln 4;
 *  - o peso da pergunta é a divergência de Jensen-Shannon entre P_B e P_G,
 *    vezes a confiança n_B / (n_B + 10), normalizado para somar 1;
 *  - a nota é a média ponderada dos sinais das respostas do lead, levada para
 *    0 a 100 (50 = igual à média; múltipla escolha entra pela média).
 * Com menos de 8 compradores a confiança é baixa e a nota não decide nada.
 */
export const ALPHA = 1;
export const CLAMP_C = 4;
export const CONF_K = 10;
export const N_MIN_COMPRADORES = 8;
const LN_C = Math.log(CLAMP_C);

export type PerfilComprador = {
  pesos: Record<string, number>;
  indice: Record<string, Record<string, number>>;
  compradores: number;
  confianca: 'ok' | 'baixa' | 'nenhuma';
  /** Por pergunta, as respostas mais sobre-representadas entre compradores (lift ≥ 1,5). */
  destaques: { chave: string; peso: number; resposta: string; lift: number }[];
};

const clamp = (x: number, lo: number, hi: number) => (x < lo ? lo : x > hi ? hi : x);
const suavizada = (contagens: number[], total: number, k: number) => contagens.map((c) => (c + ALPHA) / (total + ALPHA * k));
function jsd(p: number[], q: number[]): number {
  const m = p.map((pi, i) => (pi + q[i]) / 2);
  const kl = (a: number[], b: number[]) => a.reduce((s, ai, i) => (ai > 0 ? s + ai * Math.log(ai / b[i]) : s), 0);
  return (kl(p, m) + kl(q, m)) / 2;
}

const valores = (v: string | string[] | undefined): string[] => (v === undefined ? [] : Array.isArray(v) ? v : [v]);

export function perfilDoComprador(todos: RespostasDoQuiz[], compradores: RespostasDoQuiz[]): PerfilComprador {
  const nB = compradores.length;
  const pesosBrutos: Record<string, number> = {};
  const indice: Record<string, Record<string, number>> = {};
  const destaques: PerfilComprador['destaques'] = [];

  for (const p of PERGUNTAS) {
    const respostas = Object.keys(p.opcoes);
    const conta = (grupo: RespostasDoQuiz[]) => {
      const c = respostas.map(() => 0);
      let n = 0;
      for (const r of grupo) {
        const vs = valores(r[p.chave]);
        if (vs.length === 0) continue;
        n += 1;
        for (const v of vs) {
          const i = respostas.indexOf(v);
          if (i >= 0) c[i] += 1;
        }
      }
      return { c, n };
    };
    const b = conta(compradores);
    const g = conta(todos);
    if (b.n === 0 || respostas.length === 0) continue;
    const pB = suavizada(b.c, b.n, respostas.length);
    const pG = suavizada(g.c, g.n, respostas.length);
    pesosBrutos[p.chave] = jsd(pB, pG) * (b.n / (b.n + CONF_K));
    indice[p.chave] = {};
    respostas.forEach((resp, i) => {
      const lift = pB[i] / pG[i];
      indice[p.chave][resp] = clamp(Math.log(lift), -LN_C, LN_C);
      if (lift >= 1.5) destaques.push({ chave: p.chave, peso: 0, resposta: resp, lift: Math.round(lift * 100) / 100 });
    });
  }

  const soma = Object.values(pesosBrutos).reduce((s, w) => s + w, 0);
  const pesos = Object.fromEntries(Object.entries(pesosBrutos).map(([k, w]) => [k, soma > 0 ? w / soma : 0]));
  for (const d of destaques) d.peso = pesos[d.chave] ?? 0;
  destaques.sort((a, b) => b.peso - a.peso || b.lift - a.lift);

  return {
    pesos,
    indice,
    compradores: nB,
    confianca: nB <= 0 ? 'nenhuma' : nB < N_MIN_COMPRADORES ? 'baixa' : 'ok',
    destaques: destaques.slice(0, 8),
  };
}

/** 0 a 100, 50 = média. `null` quando nenhuma resposta do lead tem sinal. */
export function notaPorSemelhanca(r: RespostasDoQuiz, perfil: PerfilComprador): number | null {
  let soma = 0;
  let pesoUsado = 0;
  for (const [chave, peso] of Object.entries(perfil.pesos)) {
    if (peso <= 0) continue;
    const sinais = valores(r[chave])
      .map((v) => perfil.indice[chave]?.[v])
      .filter((x): x is number => typeof x === 'number');
    if (sinais.length === 0) continue;
    soma += peso * (sinais.reduce((s, x) => s + x, 0) / sinais.length);
    pesoUsado += peso;
  }
  if (pesoUsado === 0) return null;
  return Math.round(clamp((100 * (soma / pesoUsado + LN_C)) / (2 * LN_C), 0, 100));
}
