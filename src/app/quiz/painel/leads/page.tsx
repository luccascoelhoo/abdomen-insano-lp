import Link from 'next/link';
import { logado } from '@/lib/quiz-painel';
import { CORTES } from '@/content/quiz-score';
import { mensagemDoErro, PERIODOS, desde, diasDoPeriodo, lerLeads, type LeadDoPainel } from '@/lib/painel/dados';
import { rotuloDaTela } from '@/lib/painel/funil';
import { PERGUNTAS, rotuloDaOpcao } from '@/lib/painel/respostas';
import type { Faixa } from '@/lib/painel/score';
import { dataHora } from '@/lib/painel/tempo';
import { SUPERFICIE, TEMA, TEXTO } from '@/lib/painel/tema';
import { Bloco, Cabeca, Erro, Periodo, Vazio, num } from '../_ui/Blocos';
import { CopiarEmail } from './CopiarEmail';

const FAIXAS: { v: Faixa | 'todas'; rotulo: string }[] = [
  { v: 'todas', rotulo: 'Todos' },
  { v: 'quente', rotulo: 'Quentes' },
  { v: 'morno', rotulo: 'Mornos' },
  { v: 'frio', rotulo: 'Frios' },
];

const COR_FAIXA: Record<Faixa, string> = { quente: TEMA.positivo, morno: TEMA.atencao, frio: TEXTO.t3 };

const Selo = ({ faixa, nota }: { faixa: Faixa; nota: number }) => (
  <span
    className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[12px] font-semibold tabular-nums"
    style={{ color: COR_FAIXA[faixa], borderColor: SUPERFICIE.linhaForte }}
  >
    {nota}
    <span className="font-normal">{faixa}</span>
  </span>
);

const passos = (l: LeadDoPainel) =>
  [
    ['Viu a oferta', l.jornada?.viuOferta],
    ['Clicou em comprar', l.jornada?.clicouComprar],
    ['Comprou', l.comprou],
  ] as const;

function Gaveta({ l }: { l: LeadDoPainel }) {
  return (
    <div className="grid gap-5 px-3 pb-4 pt-1 md:grid-cols-3">
      <div>
        <h4 className="text-[12px] font-semibold uppercase tracking-[0.06em]" style={{ color: TEXTO.t3 }}>Nota por regras: {l.regras.nota}</h4>
        <ul className="mt-2 space-y-1 text-[13px]">
          {l.regras.itens.map((i) => (
            <li key={i.rotulo} className="flex justify-between gap-3" style={{ color: i.bateu ? TEXTO.t1 : TEXTO.t3 }}>
              <span>{i.bateu ? '✓' : '·'} {i.rotulo}</span>
              <span className="tabular-nums">{i.bateu ? `+${i.pontos}` : '0'}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[12px]" style={{ color: TEXTO.t3 }}>
          Semelhança com quem comprou: {l.semelhanca === null ? 'sem sinal' : `${l.semelhanca} (50 = média)`}
        </p>
      </div>
      <div>
        <h4 className="text-[12px] font-semibold uppercase tracking-[0.06em]" style={{ color: TEXTO.t3 }}>Jornada</h4>
        {l.jornada ? (
          <ul className="mt-2 space-y-1 text-[13px]">
            <li style={{ color: TEXTO.t2 }}>{l.jornada.telasVistas} telas vistas · mais longe: {l.jornada.ultimaTela ? rotuloDaTela(l.jornada.ultimaTela) : '—'}</li>
            {passos(l).map(([r, ok]) => (
              <li key={r} style={{ color: ok ? TEMA.positivo : TEXTO.t3 }}>{ok ? '✓' : '·'} {r}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-[13px]" style={{ color: TEXTO.t3 }}>
            Sem jornada ligada: cadastro de antes de o lead gravar a sessão (24/11/2026).{l.comprou ? ' Comprou.' : ''}
          </p>
        )}
        <h4 className="mt-4 text-[12px] font-semibold uppercase tracking-[0.06em]" style={{ color: TEXTO.t3 }}>E-mail</h4>
        <p className="mt-1 text-[13px]" style={{ color: TEXTO.t2 }}>
          {l.aceiteEmail ? (l.confirmouEmail ? 'Aceitou e confirmou' : 'Aceitou, não confirmou') : 'Não aceitou'} · plano{' '}
          {l.recebeuPlano ? 'enviado' : 'não enviado'}
          {l.noApp ? ' · já no app' : ''}
        </p>
        {Object.keys(l.utm).length ? (
          <p className="mt-1 break-all text-[12px]" style={{ color: TEXTO.t3 }}>
            Origem: {['utm_source', 'utm_campaign', 'utm_content'].map((k) => l.utm[k]).filter(Boolean).join(' · ') || (l.utm.fbclid ? 'anúncio ou link da Meta (só fbclid)' : '—')}
          </p>
        ) : null}
      </div>
      <div>
        <h4 className="text-[12px] font-semibold uppercase tracking-[0.06em]" style={{ color: TEXTO.t3 }}>Respostas</h4>
        <dl className="mt-2 space-y-1 text-[12px]">
          {PERGUNTAS.filter((p) => l.respostas[p.chave] !== undefined).map((p) => {
            const v = l.respostas[p.chave];
            return (
              <div key={p.chave} className="grid grid-cols-[1fr_1fr] gap-2">
                <dt className="truncate" title={p.titulo} style={{ color: TEXTO.t3 }}>{p.titulo}</dt>
                <dd style={{ color: TEXTO.t1 }}>{(Array.isArray(v) ? v : [v]).map((x) => rotuloDaOpcao(p.chave, x)).join(', ')}</dd>
              </div>
            );
          })}
        </dl>
      </div>
    </div>
  );
}

const POR_PAGINA = 100;
const curto = (chave: string, v: string | string[] | undefined) =>
  v === undefined ? '—' : (Array.isArray(v) ? v : [v]).map((x) => rotuloDaOpcao(chave, x)).join(', ');

const COLUNAS = 'grid-cols-[96px_1.1fr_1.7fr_74px_1fr_82px_1.1fr_86px]';

export default async function Leads({ searchParams }: { searchParams: Promise<{ faixa?: string; q?: string; dias?: string; n?: string }> }) {
  if (!(await logado())) return null;
  const sp = await searchParams;
  const faixa = (FAIXAS.some((x) => x.v === sp.faixa) ? sp.faixa : 'todas') as Faixa | 'todas';
  const dias = diasDoPeriodo(sp.dias ?? '365');
  const mostrar = Math.max(POR_PAGINA, Math.min(5000, Number(sp.n) || POR_PAGINA));
  const agora = new Date();

  let base;
  try {
    base = await lerLeads();
  } catch (e) {
    return <Erro>Não consegui ler os leads: {mensagemDoErro(e)}.</Erro>;
  }
  const busca = (sp.q ?? '').trim().toLowerCase();
  const inicio = desde(dias, agora).getTime();
  const doPeriodo = base.leads.filter((l) => new Date(l.criadoEm).getTime() >= inicio);
  const filtrados = doPeriodo
    .filter((l) => faixa === 'todas' || l.faixa === faixa)
    .filter((l) => !busca || l.nome.toLowerCase().includes(busca) || l.email.includes(busca))
    .sort((a, b) => b.nota - a.nota || b.criadoEm.localeCompare(a.criadoEm));
  const lista = filtrados.slice(0, mostrar);
  const contagem = (x: Faixa | 'todas') => (x === 'todas' ? doPeriodo.length : doPeriodo.filter((l) => l.faixa === x).length);
  const url = (mudar: Record<string, string | number>) => {
    const p = new URLSearchParams({ faixa, dias: String(dias), ...(busca ? { q: busca } : {}) });
    for (const [k, v] of Object.entries(mudar)) p.set(k, String(v));
    return `/quiz/painel/leads?${p.toString()}`;
  };

  return (
    <>
      <Cabeca
        titulo="Leads"
        sub={`${num(doPeriodo.length)} cadastros no período, sem os de teste · quente ${CORTES.quente}+, morno ${CORTES.morno}+`}
        lidoEm={agora}
        acoes={
          <div className="flex flex-wrap items-center gap-2">
            <Periodo base="/quiz/painel/leads" atual={dias} opcoes={PERIODOS} extra={`&faixa=${faixa}${busca ? `&q=${encodeURIComponent(busca)}` : ''}`} />
            <a
              href={`/quiz/painel/leads/csv?faixa=${faixa}&dias=${dias}`}
              className="rounded-[8px] border px-3 py-1.5 text-[12px] font-medium"
              style={{ borderColor: SUPERFICIE.linha, color: TEXTO.t2 }}
            >
              Exportar CSV
            </a>
          </div>
        }
      />
      <Bloco
        titulo="Quem deixou o e-mail"
        descricao="Ordenado pela nota. Toque na linha para ver a nota, a jornada e as respostas."
        acoes={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex overflow-hidden rounded-[9px] border text-[12px]" style={{ borderColor: SUPERFICIE.linha }}>
              {FAIXAS.map((x) => (
                <Link
                  key={x.v}
                  href={url({ faixa: x.v })}
                  className="px-3 py-1.5"
                  style={{ background: faixa === x.v ? SUPERFICIE.s3 : 'transparent', color: faixa === x.v ? TEXTO.t1 : TEXTO.t3 }}
                >
                  {x.rotulo} <span className="tabular-nums">{contagem(x.v)}</span>
                </Link>
              ))}
            </div>
            <form className="flex">
              <input type="hidden" name="faixa" value={faixa} />
              <input type="hidden" name="dias" value={dias} />
              <input
                name="q"
                type="search"
                defaultValue={busca}
                placeholder="Buscar nome ou e-mail"
                aria-label="Buscar nome ou e-mail"
                className="h-[30px] w-[190px] rounded-[8px] border px-2 text-[12px]"
                style={{ background: SUPERFICIE.s2, borderColor: SUPERFICIE.linha, color: TEXTO.t1 }}
              />
            </form>
          </div>
        }
      >
        {lista.length === 0 ? (
          <Vazio>Nenhum lead {faixa === 'todas' ? '' : `${faixa} `}{busca ? `com "${busca}" ` : ''}neste período.</Vazio>
        ) : (
          <>
            <div className="overflow-x-auto">
              <div className="min-w-[980px]">
                <div className={`grid ${COLUNAS} gap-3 px-3 py-2 text-[11px] uppercase tracking-[0.06em]`} style={{ color: TEXTO.t3, background: SUPERFICIE.s2 }}>
                  <span>Nota</span><span>Nome</span><span>E-mail</span><span>Idade</span><span>Objetivo</span><span>Quando</span><span>Jornada</span><span>Aceite</span>
                </div>
                {lista.map((l) => (
                  <details key={l.email} className="group border-b" style={{ borderColor: SUPERFICIE.linhaFina }}>
                    <summary className={`grid ${COLUNAS} items-center gap-3 px-3 py-2.5 text-[13px] hover:bg-[#1a1a1a] group-open:bg-[#151515]`}>
                      <span><Selo faixa={l.faixa} nota={l.nota} /></span>
                      <span className="truncate" style={{ color: TEXTO.t1 }}>{l.nome || '—'}</span>
                      <span className="flex min-w-0 items-center gap-1">
                        <span className="truncate" style={{ color: TEXTO.t2 }}>{l.email}</span>
                        <CopiarEmail email={l.email} />
                      </span>
                      <span style={{ color: TEXTO.t2 }}>{curto('faixaIdade', l.respostas.faixaIdade).replace(' a ', '–')}</span>
                      <span className="truncate" style={{ color: TEXTO.t2 }}>{curto('objetivo', l.respostas.objetivo)}</span>
                      <span style={{ color: TEXTO.t3 }} title={dataHora(l.criadoEm)}>{dataHora(l.criadoEm).replace(/\/\d{4}/, '')}</span>
                      <span style={{ color: l.comprou ? TEMA.positivo : l.jornada?.clicouComprar ? TEMA.atencao : TEXTO.t3 }}>
                        {l.comprou ? 'Comprou' : l.jornada?.clicouComprar ? 'Clicou em comprar' : l.jornada?.viuOferta ? 'Viu a oferta' : l.jornada ? 'Deixou o e-mail' : 'antes da medição'}
                      </span>
                      <span style={{ color: l.aceiteEmail ? TEXTO.t2 : TEXTO.t3 }}>{l.aceiteEmail ? (l.confirmouEmail ? 'confirmou' : 'aceitou') : 'não'}</span>
                    </summary>
                    <Gaveta l={l} />
                  </details>
                ))}
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-[12px]" style={{ color: TEXTO.t3 }}>
              <span>Mostrando {num(lista.length)} de {num(filtrados.length)}</span>
              {filtrados.length > lista.length ? (
                <Link href={url({ n: mostrar + POR_PAGINA })} className="rounded-[8px] border px-3 py-1.5" style={{ borderColor: SUPERFICIE.linha, color: TEXTO.t2 }}>
                  Mostrar mais {num(Math.min(POR_PAGINA, filtrados.length - lista.length))}
                </Link>
              ) : null}
            </div>
          </>
        )}
      </Bloco>
    </>
  );
}
