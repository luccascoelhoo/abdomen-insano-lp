import { logado } from '@/lib/quiz-painel';
import { mensagemDoErro, PERIODOS, desde, diasDoPeriodo, lerLeads } from '@/lib/painel/dados';
import { BLOCOS, PERGUNTAS } from '@/lib/painel/respostas';
import { SUPERFICIE, TEMA, TEXTO } from '@/lib/painel/tema';
import { Barra, Bloco, Cabeca, Erro, Periodo, Vazio, num } from '../_ui/Blocos';

/** Como a base respondeu cada pergunta, e de onde ela veio. Compradores ao lado, quando houver. */
export default async function Respostas({ searchParams }: { searchParams: Promise<{ dias?: string }> }) {
  if (!(await logado())) return null;
  const dias = diasDoPeriodo((await searchParams).dias);
  const agora = new Date();
  let base;
  try {
    base = await lerLeads();
  } catch (e) {
    return <Erro>Não consegui ler as respostas: {mensagemDoErro(e)}.</Erro>;
  }
  const inicio = desde(dias, agora).getTime();
  const leads = base.leads.filter((l) => new Date(l.criadoEm).getTime() >= inicio);
  const compradores = leads.filter((l) => l.comprou);
  // Só os blocos que têm pergunta de opção (o 6 é o resultado, sem pergunta).
  const blocos = Object.entries(BLOCOS)
    .map(([n, nome]) => [Number(n), nome] as const)
    .filter(([n]) => PERGUNTAS.some((p) => p.bloco === n));

  const origens = new Map<string, number>();
  for (const l of leads) {
    const o = l.utm.utm_source ? `${l.utm.utm_source}${l.utm.utm_medium ? ' · ' + l.utm.utm_medium.split('|')[0] : ''}` : l.utm.fbclid ? 'Link da Meta sem UTM' : 'Direto / sem origem';
    origens.set(o, (origens.get(o) ?? 0) + 1);
  }

  return (
    <>
      <Cabeca
        titulo="Respostas"
        sub={`${num(leads.length)} leads no período${compradores.length ? ` · ${num(compradores.length)} compraram` : ''}`}
        lidoEm={agora}
        acoes={<Periodo base="/quiz/painel/respostas" atual={dias} opcoes={PERIODOS} />}
      />
      {leads.length === 0 ? (
        <Vazio>Nenhum lead neste período.</Vazio>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          <Bloco titulo="Origem do tráfego" descricao="De onde vieram os leads do período">
            <ul className="space-y-2 text-[13px]">
              {[...origens].sort((a, b) => b[1] - a[1]).map(([o, n]) => (
                <li key={o} className="grid grid-cols-[1fr_160px_70px] items-center gap-3">
                  <span className="truncate" style={{ color: TEXTO.t1 }}>{o}</span>
                  <Barra fracao={n / leads.length} />
                  <span className="text-right" style={{ color: TEXTO.t2 }}>{num(n)} · {Math.round((100 * n) / leads.length)}%</span>
                </li>
              ))}
            </ul>
          </Bloco>
          <nav className="flex flex-wrap gap-2 text-[12px]" aria-label="Blocos do quiz">
            {blocos.map(([n, nome]) => (
              <a key={n} href={`#bloco-${n}`} className="rounded-full border px-3 py-1" style={{ borderColor: SUPERFICIE.linha, color: TEXTO.t2 }}>
                {nome}
              </a>
            ))}
          </nav>
          {blocos.map(([n, nome]) => (
            <section key={n} id={`bloco-${n}`} className="scroll-mt-20">
              <h2 className="mb-3 mt-2 text-[15px] font-semibold" style={{ color: TEXTO.t1 }}>
                <span style={{ color: TEMA.marca }}>{n}.</span> {nome}
              </h2>
              <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                {PERGUNTAS.filter((p) => p.bloco === n).map((p) => {
                  const responderam = leads.filter((l) => l.respostas[p.chave] !== undefined);
                  const compr = compradores.filter((l) => l.respostas[p.chave] !== undefined);
                  if (responderam.length === 0) return null;
                  const conta = (grupo: typeof leads, v: string) =>
                    grupo.filter((l) => {
                      const r = l.respostas[p.chave];
                      return Array.isArray(r) ? r.includes(v) : r === v;
                    }).length;
                  return (
                    <Bloco key={p.chave} titulo={p.titulo} descricao={`${num(responderam.length)} responderam${p.multipla ? ' · várias respostas por pessoa' : ''}`}>
                      <ul className="space-y-2 text-[13px]">
                        {Object.entries(p.opcoes).map(([v, rotulo]) => {
                          const n = conta(responderam, v);
                          const nb = conta(compr, v);
                          return (
                            <li key={v} className="grid grid-cols-[1fr_110px_84px] items-center gap-3">
                              <span style={{ color: n ? TEXTO.t1 : TEXTO.t3 }}>{rotulo}</span>
                              <Barra fracao={n / responderam.length} />
                              <span className="text-right tabular-nums" style={{ color: n ? TEXTO.t2 : TEXTO.t3 }}>
                                <span style={{ color: TEXTO.t3 }}>{n} · </span>
                                {Math.round((100 * n) / responderam.length)}%
                                {compr.length ? <span style={{ color: TEMA.positivo }} title="Entre os que compraram"> {Math.round((100 * nb) / compr.length)}%</span> : null}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </Bloco>
                  );
                })}
              </div>
            </section>
          ))}
          {compradores.length ? (
            <p className="text-[12px]" style={{ color: TEXTO.t3 }}>Em verde, a mesma resposta entre os que compraram.</p>
          ) : null}
          <p className="text-[12px]" style={{ color: TEXTO.t3 }}>Jornadas de teste não entram. &ldquo;Link da Meta sem UTM&rdquo;: veio do Instagram ou do Facebook sem parâmetros (bio, story ou anúncio sem as UTMs).</p>
        </div>
      )}
    </>
  );
}
