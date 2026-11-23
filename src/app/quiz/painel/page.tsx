import type { Metadata } from 'next';
import { supabaseAdmin, supabaseConfigured } from '@/lib/supabase';
import { chaveOk } from '@/lib/quiz-painel';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Funil do quiz',
  robots: { index: false, follow: false },
};

type Linha = { indice: number; tela: string; sessoes: number; pct_inicio: number | null; pct_anterior: number | null; mediana_s: number | null };

export default async function Painel({ searchParams }: { searchParams: Promise<{ k?: string; dias?: string }> }) {
  const { k, dias: d } = await searchParams;
  if (!chaveOk(k)) {
    return <main style={{ padding: 32, fontFamily: 'system-ui' }}>Acesso restrito.</main>;
  }
  const dias = [1, 7, 30].includes(Number(d)) ? Number(d) : 7;
  let linhas: Linha[] = [];
  let erro = '';
  if (!supabaseConfigured()) erro = 'Supabase não configurado.';
  else {
    const { data, error } = await supabaseAdmin().rpc('quiz_funil', { p_dias: dias });
    if (error) erro = error.message;
    else linhas = (data ?? []) as Linha[];
  }
  const topo = linhas[0]?.sessoes ?? 0;
  const fim = linhas[linhas.length - 1];
  const pior = [...linhas].filter((l) => l.indice > 0 && l.pct_anterior !== null).sort((a, b) => (a.pct_anterior! - b.pct_anterior!)).slice(0, 3);
  const cel: React.CSSProperties = { padding: '6px 10px', borderBottom: '1px solid #e5e5e5', textAlign: 'right' };
  const base = `?k=${encodeURIComponent(k!)}`;

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui', maxWidth: 900, margin: '0 auto', color: '#111' }}>
      <h1 style={{ fontSize: 22 }}>Funil do quiz</h1>
      <p><a href={`/quiz/leads?k=${encodeURIComponent(k!)}`}>Ver os leads e as respostas →</a></p>
      <p style={{ color: '#555' }}>
        Período:{' '}
        {[1, 7, 30].map((n) => (
          <a key={n} href={`${base}&dias=${n}`} style={{ marginRight: 12, fontWeight: n === dias ? 700 : 400 }}>
            {n === 1 ? 'hoje' : `${n} dias`}
          </a>
        ))}
      </p>
      {erro ? <p style={{ color: 'crimson' }}>Erro: {erro}</p> : null}
      {linhas.length === 0 && !erro ? <p>Ainda sem dados neste período.</p> : null}
      {linhas.length > 0 ? (
        <>
          <p>
            <b>{topo}</b> pessoas abriram o quiz. <b>{fim.sessoes}</b> chegaram na última tela ({fim.tela}) — {fim.pct_inicio}% do total.
          </p>
          {pior.length > 0 ? (
            <p>
              Onde mais perde gente (em relação à tela anterior):{' '}
              {pior.map((p) => `#${p.indice} ${p.tela} (${p.pct_anterior}% seguem)`).join(' · ')}
            </p>
          ) : null}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr>
                {['#', 'Tela', 'Pessoas', '% do início', '% da anterior', 'Tempo (mediana)'].map((h, i) => (
                  <th key={h} style={{ ...cel, textAlign: i < 2 ? 'left' : 'right', borderBottom: '2px solid #111' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {linhas.map((l) => (
                <tr key={l.indice} style={{ background: l.pct_anterior !== null && l.pct_anterior < 85 ? '#fff0f0' : undefined }}>
                  <td style={{ ...cel, textAlign: 'left' }}>{l.indice}</td>
                  <td style={{ ...cel, textAlign: 'left' }}>{l.tela}</td>
                  <td style={cel}>{l.sessoes}</td>
                  <td style={cel}>{l.pct_inicio ?? '-'}%</td>
                  <td style={cel}>{l.pct_anterior === null ? '-' : `${l.pct_anterior}%`}</td>
                  <td style={cel}>{l.mediana_s === null ? '-' : `${l.mediana_s}s`}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ color: '#777', fontSize: 12 }}>
            Linhas em vermelho: menos de 85% seguiram da tela anterior. Telas puladas conforme as respostas aparecem com menos gente sem ser abandono.
          </p>
        </>
      ) : null}
    </main>
  );
}
