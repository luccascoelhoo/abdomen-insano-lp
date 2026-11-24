/** Datas do painel: tudo no fuso de Brasília, que é onde o time lê. */
export const FUSO = 'America/Sao_Paulo';

/** Quão velho é o número. Número sem hora é afirmação sem data. */
export const tempoRelativo = (de: Date, agora: Date): string => {
  const seg = Math.max(0, Math.floor((agora.getTime() - de.getTime()) / 1000));
  if (seg < 60) return 'agora';
  const min = Math.floor(seg / 60);
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h} h`;
  return `há ${Math.floor(h / 24)} d`;
};

/** `AAAA-MM-DD` do dia em Brasília (não do servidor, que roda em UTC). */
export const chaveDoDia = (d: Date): string =>
  new Intl.DateTimeFormat('en-CA', { timeZone: FUSO, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);

export const dataHora = (iso: string | null): string =>
  iso ? new Date(iso).toLocaleString('pt-BR', { timeZone: FUSO, dateStyle: 'short', timeStyle: 'short' }) : '—';

/**
 * Série diária contínua: dia sem lead aparece com zero. Sem isso a curva liga
 * terça a sexta como se quarta e quinta não existissem.
 */
export function serieDiaria(datas: string[], dias: number, agora: Date): { dia: string; n: number }[] {
  const conta = new Map<string, number>();
  for (const iso of datas) {
    const k = chaveDoDia(new Date(iso));
    conta.set(k, (conta.get(k) ?? 0) + 1);
  }
  const serie: { dia: string; n: number }[] = [];
  for (let i = dias - 1; i >= 0; i--) {
    const k = chaveDoDia(new Date(agora.getTime() - i * 86_400_000));
    serie.push({ dia: k, n: conta.get(k) ?? 0 });
  }
  return serie;
}
