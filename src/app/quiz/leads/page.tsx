import type { Metadata } from 'next';
import { supabaseAdmin, supabaseConfigured } from '@/lib/supabase';
import { chaveOk } from '@/lib/quiz-painel';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Leads do quiz', robots: { index: false, follow: false } };

type Linha = {
  nome: string | null;
  email: string;
  aceite_email: boolean | null;
  aceite_email_confirmado_em: string | null;
  plano_enviado_em: string | null;
  consumido_em: string | null;
  criado_em: string;
  app: Record<string, unknown> | null;
  extras: Record<string, unknown> | null;
};

/** Perfil: de onde sai cada bloco (`extras` do quiz ou `app` = campos do app). */
const PERGUNTAS: { rotulo: string; de: 'extras' | 'app'; chave: string }[] = [
  { rotulo: 'Faixa de idade', de: 'extras', chave: 'faixaIdade' },
  { rotulo: 'Objetivo principal', de: 'extras', chave: 'objetivo' },
  { rotulo: 'O que impediu até hoje', de: 'extras', chave: 'impediu' },
  { rotulo: 'Confiança em terminar', de: 'extras', chave: 'confianca' },
  { rotulo: 'Como o corpo está', de: 'extras', chave: 'fisico' },
  { rotulo: 'Onde treina', de: 'app', chave: 'workout_place' },
  { rotulo: 'Maior obstáculo', de: 'app', chave: 'biggest_obstacle' },
  { rotulo: 'Meta do app', de: 'app', chave: 'goal' },
];

const mascarar = (e: string) => {
  const [u, d] = e.split('@');
  return d ? `${u.slice(0, 2)}***@${d}` : '***';
};
const data = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' }) : '-';
const pct = (n: number, t: number) => (t ? `${Math.round((100 * n) / t)}%` : '-');

export default async function Leads({ searchParams }: { searchParams: Promise<{ k?: string }> }) {
  const { k } = await searchParams;
  if (!chaveOk(k)) return <main style={{ padding: 32, fontFamily: 'system-ui' }}>Acesso restrito.</main>;

  let linhas: Linha[] = [];
  let erro = '';
  if (!supabaseConfigured()) erro = 'Supabase não configurado.';
  else {
    const { data: d, error } = await supabaseAdmin()
      .from('quiz_respostas')
      .select('nome,email,aceite_email,aceite_email_confirmado_em,plano_enviado_em,consumido_em,criado_em,app,extras')
      .order('criado_em', { ascending: false })
      .limit(2000);
    if (error) erro = error.message;
    else linhas = (d ?? []) as Linha[];
  }

  const total = linhas.length;
  const aceitaram = linhas.filter((l) => l.aceite_email).length;
  const confirmados = linhas.filter((l) => l.aceite_email_confirmado_em).length;
  const planos = linhas.filter((l) => l.plano_enviado_em).length;
  const viraramConta = linhas.filter((l) => l.consumido_em).length;

  const cel: React.CSSProperties = { padding: '6px 10px', borderBottom: '1px solid #e5e5e5', textAlign: 'left' };
  const valores = (l: Linha, q: (typeof PERGUNTAS)[number]): string[] => {
    const v = (l[q.de] ?? {})[q.chave];
    if (Array.isArray(v)) return v.map(String);
    return v === undefined || v === null || v === '' ? [] : [String(v)];
  };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui', maxWidth: 900, margin: '0 auto', color: '#111' }}>
      <h1 style={{ fontSize: 22 }}>Leads do quiz</h1>
      <p><a href={`/quiz/painel?k=${encodeURIComponent(k!)}`}>← Funil por tela</a></p>
      {erro ? <p style={{ color: 'crimson' }}>Erro: {erro}</p> : null}

      <table style={{ borderCollapse: 'collapse', fontSize: 15, marginBottom: 24 }}>
        <tbody>
          {[
            ['Cadastros (deixaram o e-mail)', total, ''],
            ['Aceitaram receber e-mails', aceitaram, pct(aceitaram, total)],
            ['Confirmaram o e-mail', confirmados, pct(confirmados, total)],
            ['Receberam o plano', planos, pct(planos, total)],
            ['Já viraram conta no app', viraramConta, pct(viraramConta, total)],
          ].map(([r, n, p]) => (
            <tr key={String(r)}>
              <td style={cel}>{r}</td>
              <td style={{ ...cel, fontWeight: 700 }}>{n}</td>
              <td style={{ ...cel, color: '#777' }}>{p}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {total > 0 ? (
        <>
          <h2 style={{ fontSize: 18 }}>Perfil de quem respondeu</h2>
          {PERGUNTAS.map((q) => {
            const cont = new Map<string, number>();
            for (const l of linhas) for (const v of valores(l, q)) cont.set(v, (cont.get(v) ?? 0) + 1);
            if (cont.size === 0) return null;
            return (
              <div key={q.rotulo} style={{ marginBottom: 14 }}>
                <b>{q.rotulo}</b>
                {[...cont.entries()].sort((a, b) => b[1] - a[1]).map(([v, n]) => (
                  <div key={v} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 14 }}>
                    <span style={{ width: 170 }}>{v}</span>
                    <span style={{ background: '#111', height: 8, width: `${Math.max(2, (200 * n) / total)}px`, display: 'inline-block' }} />
                    <span>{n} ({pct(n, total)})</span>
                  </div>
                ))}
              </div>
            );
          })}

          <h2 style={{ fontSize: 18 }}>Últimos cadastros</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['Quando', 'Nome', 'E-mail', 'Confirmou', 'Plano', 'No app'].map((h) => (
                  <th key={h} style={{ ...cel, borderBottom: '2px solid #111' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {linhas.slice(0, 50).map((l) => (
                <tr key={l.email}>
                  <td style={cel}>{data(l.criado_em)}</td>
                  <td style={cel}>{l.nome ?? '-'}</td>
                  <td style={cel}>{mascarar(l.email)}</td>
                  <td style={cel}>{l.aceite_email_confirmado_em ? 'sim' : l.aceite_email ? 'pendente' : 'não'}</td>
                  <td style={cel}>{l.plano_enviado_em ? 'enviado' : '-'}</td>
                  <td style={cel}>{l.consumido_em ? 'sim' : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ color: '#777', fontSize: 12 }}>E-mails aparecem mascarados. Mostrando os 50 mais recentes de {total}.</p>
        </>
      ) : null}
    </main>
  );
}
