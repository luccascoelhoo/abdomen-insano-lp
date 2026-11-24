import { logado } from '@/lib/quiz-painel';
import { mensagemDoErro, PERIODOS, desde, diasDoPeriodo, lerLeads, type LeadDoPainel } from '@/lib/painel/dados';
import { calcularTaxa, pct1 } from '@/lib/painel/taxa';
import { SUPERFICIE, TEXTO } from '@/lib/painel/tema';
import { Bloco, Cabeca, Erro, Periodo, Vazio, num } from '../_ui/Blocos';
import { GeradorDeLink } from './GeradorDeLink';

/** O nome sem o `|id` que as url_tags da Meta penduram no fim. */
const nome = (v: string | undefined) => (v ? v.split('|')[0].trim() || v : '');

type Linha = { chave: string; leads: number; quentes: number; clicaram: number; compraram: number };

function agrupar(leads: LeadDoPainel[], chave: (l: LeadDoPainel) => string): Linha[] {
  const m = new Map<string, Linha>();
  for (const l of leads) {
    const k = chave(l);
    const x = m.get(k) ?? { chave: k, leads: 0, quentes: 0, clicaram: 0, compraram: 0 };
    x.leads += 1;
    if (l.faixa === 'quente') x.quentes += 1;
    if (l.jornada?.clicouComprar) x.clicaram += 1;
    if (l.comprou) x.compraram += 1;
    m.set(k, x);
  }
  return [...m.values()].sort((a, b) => b.leads - a.leads);
}

function Tabela({ linhas, rotulo }: { linhas: Linha[]; rotulo: string }) {
  const cols = 'grid-cols-[1fr_70px_90px_90px_90px]';
  return (
    <div className="overflow-x-auto text-[13px]">
      <div className="min-w-[560px]">
        <div className={`grid ${cols} gap-3 px-3 py-2 text-[11px] uppercase tracking-[0.06em]`} style={{ color: TEXTO.t3, background: SUPERFICIE.s2 }}>
          <span>{rotulo}</span><span className="text-right">Leads</span><span className="text-right">Quentes</span><span className="text-right">Clicaram</span><span className="text-right">Compraram</span>
        </div>
        {linhas.map((l) => {
          const q = calcularTaxa(l.quentes, l.leads);
          const c = calcularTaxa(l.compraram, l.leads);
          return (
            <div key={l.chave} className={`grid ${cols} gap-3 border-b px-3 py-2`} style={{ borderColor: SUPERFICIE.linhaFina }}>
              <span className="truncate" title={l.chave} style={{ color: TEXTO.t1 }}>{l.chave}</span>
              <span className="text-right" style={{ color: TEXTO.t1 }}>{num(l.leads)}</span>
              <span className="text-right" style={{ color: q.confiavel ? TEXTO.t2 : TEXTO.t3 }}>{num(l.quentes)} · {pct1(q)}</span>
              <span className="text-right" style={{ color: TEXTO.t2 }}>{num(l.clicaram)}</span>
              <span className="text-right" style={{ color: c.confiavel ? TEXTO.t2 : TEXTO.t3 }}>{num(l.compraram)} · {pct1(c)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default async function Origens({ searchParams }: { searchParams: Promise<{ dias?: string }> }) {
  if (!(await logado())) return null;
  const dias = diasDoPeriodo((await searchParams).dias);
  const agora = new Date();
  let base;
  try {
    base = await lerLeads();
  } catch (e) {
    return <Erro>Não consegui ler as origens: {mensagemDoErro(e)}.</Erro>;
  }
  const inicio = desde(dias, agora).getTime();
  const leads = base.leads.filter((l) => new Date(l.criadoEm).getTime() >= inicio);
  const semUtm = (l: LeadDoPainel) => (l.utm.fbclid ? 'Link da Meta sem UTM' : 'Direto / sem origem');

  return (
    <>
      <Cabeca
        titulo="Origens"
        sub="Que campanha e que anúncio trazem lead bom, e o link certo para trazer mais"
        lidoEm={agora}
        acoes={<Periodo base="/quiz/painel/origens" atual={dias} opcoes={PERIODOS} />}
      />
      <div className="space-y-4 sm:space-y-6">
        {leads.length === 0 ? (
          <Vazio>Nenhum lead neste período.</Vazio>
        ) : (
          <>
            {leads.some((l) => !l.utm.utm_campaign) ? (
              <p className="rounded-[8px] border px-3 py-2 text-[12px]" style={{ borderColor: SUPERFICIE.linha, color: TEXTO.t2 }}>
                <b>Link da Meta sem UTM</b>: a pessoa veio do Instagram ou do Facebook por um link sem parâmetros (bio, story, ou anúncio
                sem as UTMs). <b>Direto / sem origem</b>: link digitado, compartilhado ou de fora da Meta. Use o gerador abaixo para
                que cada lead chegue com nome de campanha e anúncio.
              </p>
            ) : null}
            <Bloco titulo="Por campanha" descricao="Taxa em cinza: menos de 30 leads, ainda não dá para comparar">
              <Tabela rotulo="Campanha" linhas={agrupar(leads, (l) => nome(l.utm.utm_campaign) || semUtm(l))} />
            </Bloco>
            <Bloco titulo="Por anúncio" descricao="O criativo que traz quem compra">
              <Tabela rotulo="Anúncio" linhas={agrupar(leads, (l) => nome(l.utm.utm_content) || semUtm(l))} />
            </Bloco>
          </>
        )}
        <Bloco titulo="Links com UTM" descricao="Sem UTM, o lead aparece como 'sem origem' e não dá para saber qual anúncio funcionou">
          <GeradorDeLink />
        </Bloco>
      </div>
    </>
  );
}
