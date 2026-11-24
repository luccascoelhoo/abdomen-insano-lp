/**
 * Escala semântica do painel: uma cor, um significado.
 *
 * O laranja da marca nunca colore um estado. Ele fica com identidade e
 * navegação. Isso libera o âmbar para "olhe aqui", o verde para "vai bem" e o
 * vermelho para "está quebrado". Se o laranja também quisesse dizer gargalo,
 * quem lê aprenderia que a cor não informa nada.
 */
export const TEMA = {
  marca: '#ff6b00',
  marcaClaro: '#ff8a33',
  marcaFraco: 'rgba(255,107,0,0.14)',
  marcaBorda: 'rgba(255,107,0,0.34)',
  positivo: '#34D399',
  positivoFraco: 'rgba(52,211,153,0.12)',
  positivoBorda: 'rgba(52,211,153,0.30)',
  atencao: '#ffce3b',
  atencaoFraco: 'rgba(255,206,59,0.10)',
  atencaoBorda: 'rgba(255,206,59,0.28)',
  erro: '#FF6369',
  erroFraco: 'rgba(229,72,77,0.12)',
  erroBorda: 'rgba(229,72,77,0.35)',
} as const;

/** Superfícies em hex sólido: transparência sobre transparência não cria degrau. */
export const SUPERFICIE = {
  s0: '#000000',
  s1: '#0d0d0d',
  s2: '#151515',
  s3: '#1e1e1e',
  linhaFina: '#1a1a1a',
  linha: '#2a2a2a',
  linhaForte: '#3a3a3a',
} as const;

export const ELEVACAO_CARTAO = 'inset 0 1px 0 rgba(255,255,255,0.055), 0 1px 2px rgba(0,0,0,0.55)';

/** `t3` é o piso para texto (4,5:1 sobre o preto). `t4` só para traço e ícone. */
export const TEXTO = {
  t1: 'rgba(255,255,255,0.92)',
  t2: 'rgba(255,255,255,0.62)',
  t3: 'rgba(255,255,255,0.50)',
  t4: 'rgba(255,255,255,0.32)',
} as const;
