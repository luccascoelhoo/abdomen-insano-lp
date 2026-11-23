import { supabaseAdmin, supabaseConfigured } from '@/lib/supabase';
import { logado } from '@/lib/quiz-painel';
import { telasQuiz } from '@/content/quiz';

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

/**
 * Perfil: de onde sai cada bloco. `de` = onde o valor foi gravado (`extras` do
 * quiz ou `app` = campo do app); `tela` = a tela do quiz cujas opções dão o
 * nome legível (quando o valor é o mesmo id da opção).
 */
const PERGUNTAS: { rotulo: string; de: 'extras' | 'app'; chave: string; tela?: string }[] = [
  { rotulo: 'Faixa de idade', de: 'extras', chave: 'faixaIdade', tela: 'faixaIdade' },
  { rotulo: 'Objetivo principal', de: 'extras', chave: 'objetivo', tela: 'objetivo' },
  { rotulo: 'O que impediu até hoje', de: 'extras', chave: 'impediu', tela: 'impediu' },
  { rotulo: 'Confiança em terminar', de: 'extras', chave: 'confianca', tela: 'confianca' },
  { rotulo: 'Como o corpo está', de: 'extras', chave: 'fisico', tela: 'fisico' },
  { rotulo: 'Onde treina', de: 'app', chave: 'workout_place', tela: 'local' },
  { rotulo: 'Maior obstáculo', de: 'app', chave: 'biggest_obstacle', tela: 'obstaculo' },
  { rotulo: 'Meta do app', de: 'app', chave: 'goal' },
];

/** Valores do app que não vêm de uma opção do quiz (calculados pela meta de peso). */
const ROTULOS_FIXOS: Record<string, Record<string, string>> = {
  goal: { lose: 'Perder peso', gain: 'Ganhar peso', maintain: 'Manter o peso' },
};

/** chave da tela → (id da opção → texto que a pessoa viu). */
const NOMES: Record<string, Record<string, string>> = {};
for (const t of telasQuiz) {
  if ('chave' in t && 'opcoes' in t && Array.isArray(t.opcoes)) {
    NOMES[t.chave] = Object.fromEntries(t.opcoes.map((o) => [o.v, o.rotulo]));
  }
}
const nomeLegivel = (q: { chave: string; tela?: string }, v: string) =>
  (q.tela && NOMES[q.tela]?.[v]) || ROTULOS_FIXOS[q.chave]?.[v] || v;

const data = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' }) : '-';
const pct = (n: number, t: number) => (t ? `${Math.round((100 * n) / t)}%` : '0%');

export default async function Leads() {
  // O layout só esconde a tela: a página ainda seria executada. Sem sessão, não busca nada.
  if (!(await logado())) return null;
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

  const valores = (l: Linha, q: (typeof PERGUNTAS)[number]): string[] => {
    const v = (l[q.de] ?? {})[q.chave];
    if (Array.isArray(v)) return v.map(String);
    return v === undefined || v === null || v === '' ? [] : [String(v)];
  };

  return (
    <>
      <div className="pn-cabeca">
        <div>
          <h1>Leads do quiz</h1>
          <p className="pn-sub">Quem deixou o e-mail e o que respondeu.</p>
        </div>
      </div>

      {erro ? <p className="pn-erro">Erro: {erro}</p> : null}
      {total === 0 && !erro ? <div className="pn-vazio">Nenhum cadastro ainda.</div> : null}

      {total > 0 ? (
        <>
          <section className="pn-kpis pn-kpis--5">
            {[
              ['Cadastros', total, ''],
              ['Aceitaram e-mails', aceitaram, pct(aceitaram, total)],
              ['Confirmaram', confirmados, pct(confirmados, total)],
              ['Receberam o plano', planos, pct(planos, total)],
              ['Já no app', viraramConta, pct(viraramConta, total)],
            ].map(([r, n, p]) => (
              <div className="pn-kpi" key={String(r)}>
                <span>{r}</span>
                <b>{n}</b>
                <small>{p || ' '}</small>
              </div>
            ))}
          </section>

          <section className="pn-cartao">
            <h2>Últimos cadastros</h2>
            <div className="pn-rolagem">
              <table className="pn-tabela">
                <thead>
                  <tr>
                    <th>Quando</th>
                    <th>Nome</th>
                    <th>E-mail</th>
                    <th>Idade</th>
                    <th>Objetivo</th>
                    <th>E-mail confirmado</th>
                    <th>Plano</th>
                    <th>No app</th>
                  </tr>
                </thead>
                <tbody>
                  {linhas.slice(0, 100).map((l) => {
                    const conf = l.aceite_email_confirmado_em ? ['sim', 'ok'] : l.aceite_email ? ['pendente', 'espera'] : ['não aceitou', 'nao'];
                    return (
                      <tr key={l.email}>
                        <td>{data(l.criado_em)}</td>
                        <td>{l.nome ?? '-'}</td>
                        <td className="pn-email">{l.email}</td>
                        <td>{l.extras?.faixaIdade ? nomeLegivel({ chave: 'faixaIdade', tela: 'faixaIdade' }, String(l.extras.faixaIdade)) : '-'}</td>
                        <td>{l.extras?.objetivo ? nomeLegivel({ chave: 'objetivo', tela: 'objetivo' }, String(l.extras.objetivo)) : '-'}</td>
                        <td><span className={`pn-pilula pn-pilula--${conf[1]}`}>{conf[0]}</span></td>
                        <td>{l.plano_enviado_em ? <span className="pn-pilula pn-pilula--ok">enviado</span> : '-'}</td>
                        <td>{l.consumido_em ? <span className="pn-pilula pn-pilula--ok">sim</span> : '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="pn-nota">Mostrando os {Math.min(100, total)} mais recentes de {total}.</p>
          </section>

          <section className="pn-perfil">
            {PERGUNTAS.map((q) => {
              const cont = new Map<string, number>();
              for (const l of linhas) for (const v of valores(l, q)) cont.set(v, (cont.get(v) ?? 0) + 1);
              if (cont.size === 0) return null;
              const maior = Math.max(...cont.values());
              return (
                <div className="pn-cartao" key={q.rotulo}>
                  <h2>{q.rotulo}</h2>
                  <ul className="pn-barras">
                    {[...cont.entries()].sort((a, b) => b[1] - a[1]).map(([v, n]) => (
                      <li key={v}>
                        <span className="pn-barras__rotulo">{nomeLegivel(q, v)}</span>
                        <span className="pn-barras__trilho"><span style={{ width: `${(100 * n) / maior}%` }} /></span>
                        <span className="pn-barras__n">{n} <small>{pct(n, total)}</small></span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </section>
        </>
      ) : null}
    </>
  );
}
