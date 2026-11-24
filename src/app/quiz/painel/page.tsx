import Link from 'next/link';
import { logado } from '@/lib/quiz-painel';
import { CORTES } from '@/content/quiz-score';
import { DEGRAUS, maiorQueda, retencaoPorTela, trechoMedido } from '@/lib/painel/funil';
import { mensagemDoErro, PERIODOS, desde, diasDoPeriodo, lerFunil, lerLeads } from '@/lib/painel/dados';
import { serieDiaria } from '@/lib/painel/tempo';
import { SUPERFICIE, TEMA, TEXTO } from '@/lib/painel/tema';
import { Barra, Bloco, Cabeca, Cartao, Erro, FunilDeBarras, Periodo, Vazio, num, textoDaTaxa } from './_ui/Blocos';
import { CurvaPorDia, CurvaRetencao } from './_ui/Curvas';

export default async function Painel({ searchParams }: { searchParams: Promise<{ dias?: string }> }) {
  // O layout só esconde a tela: a página ainda seria executada. Sem sessão, não lê nada.
  if (!(await logado())) return null;
  const dias = diasDoPeriodo((await searchParams).dias);
  const agora = new Date();

  let dados;
  try {
    const [funil, base] = await Promise.all([lerFunil(dias), lerLeads()]);
    dados = { ...funil, ...base };
  } catch (e) {
    return <Erro>Não consegui ler o painel: {mensagemDoErro(e)}.</Erro>;
  }

  const { degraus, telas: linhas, leads, perfil } = dados;
  const inicio = desde(dias, agora).getTime();
  const doPeriodo = leads.filter((l) => new Date(l.criadoEm).getTime() >= inicio);
  const hoje = leads.filter((l) => new Date(l.criadoEm).getTime() >= desde(1, agora).getTime()).length;
  const quentes = doPeriodo.filter((l) => l.faixa === 'quente').length;
  const mornos = doPeriodo.filter((l) => l.faixa === 'morno').length;
  const frios = doPeriodo.length - quentes - mornos;
  const naoCompraram = doPeriodo.filter((l) => !l.comprou);
  const semJornada = doPeriodo.filter((l) => !l.jornada).length;
  const alcancaveis = naoCompraram.filter((l) => l.aceiteEmail).length;
  const diasDaCurva = Math.min(Math.max(dias, 14), 30);
  // "Tudo" divide pelos dias desde o primeiro lead, não por 365.
  const primeiro = leads.length ? Math.min(...leads.map((l) => new Date(l.criadoEm).getTime())) : agora.getTime();
  const diasDeBase = dias === 365 ? Math.max(1, Math.ceil((agora.getTime() - primeiro) / 86_400_000)) : dias;
  const serie = serieDiaria(leads.map((l) => l.criadoEm), diasDaCurva, agora);

  const telas = retencaoPorTela(linhas);
  const { curva, base, omitidas } = trechoMedido(telas);
  const queda = maiorQueda(telas);
  const condicionais = telas.filter((t) => t.condicional);

  const decide = perfil.confianca === 'ok' ? 'semelhança com quem comprou' : 'regras (v1)';

  return (
    <>
      <Cabeca
        titulo="Painel"
        sub={`Quiz do Desafio Abdômen Insano · ${PERIODOS.find((p) => p.dias === dias)?.rotulo.toLowerCase()}`}
        lidoEm={agora}
        acoes={<Periodo base="/quiz/painel" atual={dias} opcoes={PERIODOS} />}
      />

      <div className="space-y-4 sm:space-y-6">
        <Bloco titulo="Leads" descricao="Quantos deixaram o e-mail, e quantos já viraram compra">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Cartao titulo="No período" valor={num(doPeriodo.length)} detalhe="deixaram o e-mail" />
            <Cartao titulo="Hoje" valor={num(hoje)} detalhe="desde a meia-noite (Brasília)" />
            <Cartao
              titulo="Ritmo"
              valor={(doPeriodo.length / diasDeBase).toFixed(1).replace('.', ',')}
              detalhe="leads por dia no período"
            />
            <Cartao
              titulo="Compraram"
              valor={num(doPeriodo.filter((l) => l.comprou).length)}
              detalhe={`${textoDaTaxa(doPeriodo.filter((l) => l.comprou).length, doPeriodo.length)} dos leads do período`}
              tom={doPeriodo.some((l) => l.comprou) ? 'positivo' : 'neutro'}
            />
          </div>
        </Bloco>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          <Bloco titulo="Qualidade da base" descricao="Quem entrou vale a conversa?">
            <div className="grid grid-cols-3 gap-3">
              <Cartao titulo="Quentes" valor={num(quentes)} detalhe={`nota ${CORTES.quente}+`} tom={quentes ? 'positivo' : 'neutro'} />
              <Cartao titulo="Mornos" valor={num(mornos)} detalhe={`nota ${CORTES.morno} a ${CORTES.quente - 1}`} />
              <Cartao titulo="Frios" valor={num(frios)} detalhe={`abaixo de ${CORTES.morno}`} />
            </div>
            <p className="mt-3 text-[12px]" style={{ color: TEXTO.t3 }}>
              Nota decidida por <b style={{ color: TEXTO.t2 }}>{decide}</b>.{' '}
              {perfil.confianca === 'ok'
                ? `${perfil.compradores} compradores vindos do quiz formam o perfil.`
                : `A semelhança liga sozinha com 8 compradores vindos do quiz (hoje: ${perfil.compradores}).`}{' '}
              <Link href="/quiz/painel/leads" className="underline" style={{ color: TEMA.marcaClaro }}>Ver os leads</Link>
            </p>
          </Bloco>

          <Bloco titulo="Leads por dia" descricao={`Últimos ${diasDaCurva} dias: o ritmo está subindo ou caindo?`}>
            {leads.length ? <CurvaPorDia dias={serie} /> : <Vazio>Nenhum lead ainda.</Vazio>}
          </Bloco>
        </div>

        <Bloco titulo="Onde o funil perde" descricao="Em que degrau a gente some, e quem dá para buscar de volta">
          {degraus.abriram === 0 ? (
            <Vazio>Ninguém abriu o quiz neste período (jornadas de teste não contam).</Vazio>
          ) : (
            <>
              <FunilDeBarras degraus={DEGRAUS.map((d) => ({ rotulo: d.rotulo, valor: degraus[d.chave] }))} />
              {semJornada > 0 ? (
                <p className="mt-3 rounded-[8px] border px-3 py-2 text-[12px]" style={{ borderColor: SUPERFICIE.linha, color: TEXTO.t2 }}>
                  {num(semJornada)} {semJornada === 1 ? 'lead do período é' : 'leads do período são'} de antes de a medição por tela ligar o
                  lead à jornada (24/11/2026): {semJornada === 1 ? 'conta' : 'contam'} em &ldquo;Deixaram o e-mail&rdquo; mas não nos degraus
                  anteriores nem nos seguintes.
                </p>
              ) : null}
              {naoCompraram.length > 0 ? (
                <div className="mt-3">
                  <Cartao
                    titulo="Deixaram o e-mail e não compraram"
                    valor={num(naoCompraram.length)}
                    detalhe={`${num(alcancaveis)} aceitaram receber e-mail: dá para buscar de volta. Lista na aba Leads.`}
                    tom="atencao"
                  />
                </div>
              ) : null}
              <details className="mt-3 text-[12px]" style={{ color: TEXTO.t3 }}>
                <summary className="inline-flex items-center gap-1 underline decoration-dotted underline-offset-2">Como contamos</summary>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>Abriram, chegaram ao e-mail, viram a oferta e clicaram: pessoas (sessões) distintas no período.</li>
                  <li>Deixaram o e-mail: cadastros do período.</li>
                  <li>Compraram: compra aprovada no período que saiu do botão do quiz, ou de lead que comprou depois de responder. Cliente antigo que refaz o quiz não conta.</li>
                  <li>Jornadas de teste (do time ou com ?teste=1) ficam fora de tudo.</li>
                </ul>
              </details>

              <h3 className="mt-6 text-[13px] font-semibold" style={{ color: TEXTO.t2 }}>Retenção tela a tela</h3>
              {curva.length >= 2 ? (
                <>
                  <div className="mt-2">
                    <CurvaRetencao curva={curva} base={base} queda={queda} />
                  </div>
                  <p className="mt-2 text-[13px]" style={{ color: TEXTO.t2 }}>
                    {queda ? (
                      <>
                        A maior queda é em <b style={{ color: TEMA.atencao }}>{queda.rotulo}</b>: só {queda.daAnterior}% de quem viu a tela anterior
                        chegou nela ({num(queda.perderam)} saíram ali).
                      </>
                    ) : (
                      'Sem queda para apontar: falta gente (mínimo de 10 na tela anterior) ou ninguém saiu entre duas telas seguidas.'
                    )}
                  </p>
                  <ol className="mt-4 divide-y text-[13px]" style={{ borderColor: SUPERFICIE.linhaFina }}>
                    {curva.map((t, i) => (
                      <li key={t.id} className="grid grid-cols-[28px_1fr_120px_64px_80px_48px] items-center gap-3 py-1.5" style={{ borderColor: SUPERFICIE.linhaFina }}>
                        <span style={{ color: TEXTO.t3 }}>{i + 1}</span>
                        <span className="truncate" title={t.rotulo} style={{ color: queda?.id === t.id ? TEMA.atencao : TEXTO.t1 }}>{t.rotulo}</span>
                        <Barra fracao={t.chegaram / base} cor={queda?.id === t.id ? TEMA.atencao : TEMA.marca} />
                        <span className="text-right" style={{ color: TEXTO.t1 }}>{num(t.chegaram)}</span>
                        <span className="text-right" style={{ color: t.daAnterior !== null && t.daAnterior < 85 ? TEMA.atencao : TEXTO.t3 }}>
                          {t.daAnterior === null ? '' : `${t.daAnterior}%`}
                        </span>
                        <span className="text-right" style={{ color: TEXTO.t3 }} title="Tempo mediano na tela">
                          {t.medianaS === null ? '' : `${t.medianaS}s`}
                        </span>
                      </li>
                    ))}
                  </ol>
                  <p className="mt-2 text-[12px]" style={{ color: TEXTO.t3 }}>
                    Colunas: pessoas que viram a tela · % de quem viu a tela comum anterior (âmbar abaixo de 85%) · tempo mediano na tela.
                    {omitidas.length ? ` ${omitidas.length} tela(s) antes do pico ficaram fora: rastro de antes da medição completa.` : ''}
                  </p>
                  {condicionais.length ? (
                    <p className="mt-2 text-[12px]" style={{ color: TEXTO.t3 }}>
                      Telas que dependem da resposta (fora da curva, menos gente nelas não é abandono):{' '}
                      {condicionais.map((t) => `${t.rotulo} (${num(t.chegaram)})`).join(' · ')}.
                    </p>
                  ) : null}
                </>
              ) : (
                <Vazio>Ainda não há telas suficientes medidas neste período para desenhar a curva.</Vazio>
              )}
            </>
          )}
        </Bloco>
      </div>
    </>
  );
}
