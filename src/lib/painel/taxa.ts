/**
 * Taxa com piso de amostra: abaixo de 30 na base, a porcentagem existe mas não
 * se compara com outra. Três visitas e uma conversão não são "33%".
 */
export const MINIMO_PARA_TAXA = 30;

export interface Taxa {
  valor: number;
  confiavel: boolean;
  temBase: boolean;
}

export const calcularTaxa = (parte: number, base: number, minimo = MINIMO_PARA_TAXA): Taxa => ({
  valor: base > 0 ? (parte / base) * 100 : 0,
  confiavel: base >= minimo,
  temBase: base > 0,
});

export const pct1 = (t: Taxa): string => (t.temBase ? `${t.valor.toFixed(1).replace('.', ',')}%` : '—');
