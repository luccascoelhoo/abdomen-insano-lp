import Link from 'next/link';
import { supabaseAdmin, supabaseConfigured } from '@/lib/supabase';

type Linha = { indice: number; tela: string; sessoes: number; pct_inicio: number | null; pct_anterior: number | null; mediana_s: number | null };

const PERIODOS = [
  { dias: 1, rotulo: 'Hoje' },
  { dias: 7, rotulo: '7 dias' },
  { dias: 30, rotulo: '30 dias' },
];

export default async function Funil({ searchParams }: { searchParams: Promise<{ dias?: string }> }) {
  const { dias: d } = await searchParams;
  const dias = [1, 7, 30].includes(Number(d)) ? Number(d) : 7;

  let linhas: Linha[] = [];
  let erro = '';
  if (!supabaseConfigured()) erro = 'Supabase não configurado.';
  else {
    const { data, error } = await supabaseAdmin().rpc('quiz_funil', { p_dias: dias });
    if (error) erro = error.message;
    else linhas = (data ?? []) as Linha[];
  }

  const inicio = linhas[0]?.sessoes ?? 0;
  const fim = linhas[linhas.length - 1];
  const maiorQueda = [...linhas]
    .filter((l) => l.indice > 0 && l.pct_anterior !== null)
    .sort((a, b) => a.pct_anterior! - b.pct_anterior!)[0];

  return (
    <>
      <div className="pn-cabeca">
        <div>
          <h1>Funil do quiz</h1>
          <p className="pn-sub">Quantas pessoas chegam em cada tela e onde elas saem.</p>
        </div>
        <div className="pn-seg" role="group" aria-label="Período">
          {PERIODOS.map((p) => (
            <Link key={p.dias} href={`/quiz/painel?dias=${p.dias}`} className={p.dias === dias ? 'pn-seg--ativo' : undefined}>
              {p.rotulo}
            </Link>
          ))}
        </div>
      </div>

      {erro ? <p className="pn-erro">Erro: {erro}</p> : null}
      {linhas.length === 0 && !erro ? <div className="pn-vazio">Ainda sem dados neste período.</div> : null}

      {linhas.length > 0 ? (
        <>
          <section className="pn-kpis">
            <div className="pn-kpi">
              <span>Abriram o quiz</span>
              <b>{inicio}</b>
            </div>
            <div className="pn-kpi">
              <span>Chegaram ao fim</span>
              <b>{fim.sessoes}</b>
              <small>{fim.pct_inicio}% do total · {fim.tela}</small>
            </div>
            <div className="pn-kpi pn-kpi--alerta">
              <span>Maior queda</span>
              <b>{maiorQueda ? `${Math.round(100 - maiorQueda.pct_anterior!)}%` : '-'}</b>
              <small>{maiorQueda ? `saem na tela ${maiorQueda.indice} (${maiorQueda.tela})` : 'sem dados'}</small>
            </div>
          </section>

          <section className="pn-cartao">
            <h2>Tela por tela</h2>
            <ol className="pn-funil">
              {linhas.map((l) => {
                const queda = l.pct_anterior !== null && l.pct_anterior < 85;
                return (
                  <li key={l.indice} className={queda ? 'pn-funil__linha pn-funil__linha--queda' : 'pn-funil__linha'}>
                    <span className="pn-funil__n">{l.indice}</span>
                    <span className="pn-funil__tela">{l.tela}</span>
                    <span className="pn-funil__barra" aria-hidden="true">
                      <span style={{ width: `${Math.max(1, l.pct_inicio ?? 0)}%` }} />
                    </span>
                    <span className="pn-funil__num"><b>{l.sessoes}</b> <small>{l.pct_inicio ?? 0}%</small></span>
                    <span className="pn-funil__ret" title="Quantos seguiram da tela anterior">
                      {l.pct_anterior === null ? '' : `${l.pct_anterior}% seguem`}
                    </span>
                    <span className="pn-funil__tempo" title="Tempo mediano na tela">
                      {l.mediana_s === null ? '' : `${l.mediana_s}s`}
                    </span>
                  </li>
                );
              })}
            </ol>
            <p className="pn-nota">
              Em vermelho: menos de 85% seguiram da tela anterior. Telas puladas conforme as respostas aparecem com
              menos gente sem ser abandono.
            </p>
          </section>
        </>
      ) : null}
    </>
  );
}
