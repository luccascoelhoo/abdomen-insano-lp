import { telasQuiz } from '@/content/quiz';

/**
 * Onde o funil do quiz perde gente: a retenção tela a tela.
 *
 * Porte da leitura do painel de captação da casa: conta sessões distintas por
 * tela e deixa a curva cair sozinha. A maior queda entre duas telas seguidas é
 * a pergunta que espanta. É diferente de "onde a pessoa parou", e melhor para
 * decidir o que mudar: parada acumula no fim por construção, a queda relativa
 * aponta a tela específica.
 */

/** Uma linha de `quiz_painel_telas`. */
export type LinhaTela = { tela: string; menor_indice: number; sessoes: number; mediana_s: number | null };

export type TelaDoFunil = {
  indice: number;
  id: string;
  rotulo: string;
  chegaram: number;
  /** % de quem viu a tela comum anterior. `null` na primeira e nas condicionais. */
  daAnterior: number | null;
  perderam: number;
  condicional: boolean;
  medianaS: number | null;
};

/** O id que o quiz grava para a tela `i` (o mesmo de `components/quiz/Quiz.tsx`). */
export function idDaTela(i: number): string {
  const t = telasQuiz[i];
  return 'chave' in t && t.chave ? String(t.chave) : t.k === 'info' ? `info-${i}` : t.k;
}

const semMarcacao = (s: string) => s.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();

/** Nome curto e legível da tela, para quem não conhece o código. */
export function rotuloDaTela(id: string): string {
  const i = ORDEM.indexOf(id);
  if (i < 0) return id;
  const t = telasQuiz[i];
  const fixos: Record<string, string> = {
    capa: 'Resultado da capa de gordura',
    carregando: 'Montando o plano',
    email: 'Pede o e-mail',
    diagnostico: 'Diagnóstico',
    projecao: 'Os seus números',
    plano: 'O plano',
    desconto: 'Desconto liberado',
    oferta: 'Oferta',
  };
  if (fixos[t.k]) return fixos[t.k];
  const texto =
    ('pergunta' in t && typeof t.pergunta === 'string' && t.pergunta) ||
    ('titulo' in t && typeof t.titulo === 'string' && t.titulo) ||
    id;
  const curto = semMarcacao(texto);
  return t.k === 'info' ? `Aviso: ${curto}` : curto;
}

/** A ordem atual do quiz, por id de tela. */
export const ORDEM: string[] = telasQuiz.map((_, i) => idDaTela(i));

/** Telas que só aparecem conforme a resposta: menos gente nelas não é abandono. */
export const CONDICIONAIS = new Set(ORDEM.filter((_, i) => 'quando' in telasQuiz[i] && telasQuiz[i].quando));

const pct = (parte: number, base: number) => (base > 0 ? Math.round((1000 * parte) / base) / 10 : 0);

export function retencaoPorTela(
  linhas: LinhaTela[],
  condicionais: Set<string> = CONDICIONAIS,
  ordemAtual: string[] = ORDEM,
): TelaDoFunil[] {
  const posicao = new Map(ordemAtual.map((id, i) => [id, i]));

  // Tela que saiu do quiz fica fora da curva: no meio da sequência atual ela
  // só distorceria a comparação com a anterior.
  const ordenadas = linhas
    .filter((l) => posicao.size === 0 || posicao.has(l.tela))
    .map((l) => ({ ...l, pos: posicao.get(l.tela) ?? l.menor_indice }))
    .sort((a, b) => a.pos - b.pos);

  // A comparação anda pelo caminho comum, pulando as condicionais. Comparando
  // com a imediatamente anterior, a tela depois de uma condicional volta ao
  // volume cheio e marca "246% da anterior", número que não quer dizer nada.
  let anteriorComum: number | null = null;
  return ordenadas.map((l) => {
    const condicional = condicionais.has(l.tela);
    const chegaram = Number(l.sessoes);
    const daAnterior = condicional || anteriorComum === null ? null : pct(chegaram, anteriorComum);
    // Nunca negativo: alguém pode voltar e passar de novo por uma tela.
    const perderam = condicional || anteriorComum === null ? 0 : Math.max(0, anteriorComum - chegaram);
    if (!condicional) anteriorComum = chegaram;
    return {
      indice: l.pos,
      id: l.tela,
      rotulo: rotuloDaTela(l.tela),
      chegaram,
      daAnterior,
      perderam,
      condicional,
      medianaS: l.mediana_s === null ? null : Number(l.mediana_s),
    };
  });
}

/**
 * O 100% da curva começa no pico do caminho comum, não na primeira tela.
 * Telas antes do pico com contagem menor não são retenção: são rastro que
 * ainda não existia quando a medição entrou (ou foi renomeado).
 */
export function trechoMedido(telas: TelaDoFunil[]): { curva: TelaDoFunil[]; base: number; omitidas: TelaDoFunil[] } {
  const comuns = telas.filter((t) => !t.condicional);
  if (comuns.length === 0) return { curva: [], base: 0, omitidas: [] };
  const base = Math.max(...comuns.map((t) => t.chegaram));
  const pico = comuns.findIndex((t) => t.chegaram === base);
  return {
    curva: comuns.slice(pico).map((t, i) => (i === 0 ? { ...t, daAnterior: null, perderam: 0 } : t)),
    base,
    omitidas: comuns.slice(0, pico),
  };
}

/**
 * A passagem de uma tela para a seguinte onde mais gente sai. Exige um mínimo
 * de gente na origem: com três sessões, uma desistência vira "queda de 33%" e
 * mandaria reescrever uma pergunta por causa de uma pessoa. Sem perda, não há
 * maior queda (e o painel não inventa uma).
 */
export function maiorQueda(telas: TelaDoFunil[], minimoNaOrigem = 10): TelaDoFunil | null {
  const comuns = telas.filter((t) => !t.condicional);
  let pior: TelaDoFunil | null = null;
  for (let i = 1; i < comuns.length; i++) {
    const tela = comuns[i];
    if (comuns[i - 1].chegaram < minimoNaOrigem) continue;
    if (tela.daAnterior === null || tela.daAnterior >= 100 || tela.perderam === 0) continue;
    if (!pior || tela.daAnterior < (pior.daAnterior ?? 100)) pior = tela;
  }
  return pior;
}

/** Os degraus da jornada, na ordem. Uma linha de `quiz_painel_degraus`. */
export type Degraus = {
  abriram: number;
  viram_email: number;
  leads: number;
  viram_oferta: number;
  clicaram: number;
  compraram: number;
};

export const DEGRAUS: { chave: keyof Degraus; rotulo: string }[] = [
  { chave: 'abriram', rotulo: 'Abriram o quiz' },
  { chave: 'viram_email', rotulo: 'Chegaram ao e-mail' },
  { chave: 'leads', rotulo: 'Deixaram o e-mail' },
  { chave: 'viram_oferta', rotulo: 'Viram a oferta' },
  { chave: 'clicaram', rotulo: 'Clicaram em comprar' },
  { chave: 'compraram', rotulo: 'Compraram' },
];
