import type { ReactNode } from 'react';
import Link from 'next/link';
import { ELEVACAO_CARTAO, SUPERFICIE, TEMA, TEXTO } from '@/lib/painel/tema';
import { calcularTaxa, MINIMO_PARA_TAXA } from '@/lib/painel/taxa';
import { SeloAtualizacao } from './AutoAtualizar';

/** Os tijolos visuais do painel, num lugar só (o bloco é o chão, o cartão sobe um degrau). */

export type TomDoCartao = 'neutro' | 'positivo' | 'atencao' | 'erro';

const TONS: Record<TomDoCartao, { cor: string; fundo: string; borda: string } | null> = {
  neutro: null,
  positivo: { cor: TEMA.positivo, fundo: TEMA.positivoFraco, borda: TEMA.positivoBorda },
  atencao: { cor: TEMA.atencao, fundo: TEMA.atencaoFraco, borda: TEMA.atencaoBorda },
  erro: { cor: TEMA.erro, fundo: TEMA.erroFraco, borda: TEMA.erroBorda },
};

export function Cartao({ titulo, valor, detalhe, tom = 'neutro' }: { titulo: string; valor: string; detalhe?: ReactNode; tom?: TomDoCartao }) {
  const t = TONS[tom];
  return (
    <div
      className="rounded-[10px] border p-4"
      style={{ background: t ? t.fundo : SUPERFICIE.s2, borderColor: t ? t.borda : SUPERFICIE.linha, boxShadow: ELEVACAO_CARTAO }}
    >
      <p className="text-[11px] uppercase tracking-[0.06em]" style={{ color: TEXTO.t3 }}>{titulo}</p>
      <p className="mt-1 text-[26px] font-semibold tracking-[-0.01em] tabular-nums" style={{ color: t ? t.cor : TEXTO.t1 }}>
        {valor}
      </p>
      {detalhe ? <p className="mt-1.5 text-[12px] leading-[1.45]" style={{ color: TEXTO.t3 }}>{detalhe}</p> : null}
    </div>
  );
}

export function Bloco({ titulo, descricao, acoes, children }: { titulo: string; descricao?: string; acoes?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-[14px] border p-4 sm:p-5" style={{ background: SUPERFICIE.s1, borderColor: SUPERFICIE.linha }}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[12px] font-semibold uppercase tracking-[0.09em]" style={{ color: TEXTO.t3 }}>{titulo}</h2>
          {descricao ? <p className="mt-1 text-[12px]" style={{ color: TEXTO.t3 }}>{descricao}</p> : null}
        </div>
        {acoes}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function Erro({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[10px] border p-4 text-[13px]" style={{ borderColor: TEMA.erroBorda, background: TEMA.erroFraco, color: TEXTO.t1 }}>
      {children}
    </div>
  );
}

export function Vazio({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-[10px] border border-dashed p-5 text-center text-[13px]" style={{ borderColor: SUPERFICIE.linhaForte, color: TEXTO.t3 }}>
      {children}
    </p>
  );
}

/** Cabeçalho da aba: título, uma linha do que ela responde, e de quando é o número. */
export function Cabeca({ titulo, sub, lidoEm, acoes }: { titulo: string; sub: string; lidoEm: Date; acoes?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-[22px] font-semibold tracking-[-0.01em]" style={{ color: TEXTO.t1 }}>{titulo}</h1>
          <SeloAtualizacao lidoEm={lidoEm.toISOString()} />
        </div>
        <p className="mt-1 text-[13px]" style={{ color: TEXTO.t3 }}>{sub}</p>
      </div>
      {acoes}
    </div>
  );
}

/** Seletor de período por link: o período mora na URL, então dá para mandar a tela para alguém. */
export function Periodo({ base, atual, opcoes, extra = '' }: { base: string; atual: number; opcoes: readonly { dias: number; rotulo: string }[]; extra?: string }) {
  return (
    <div className="flex overflow-hidden rounded-[9px] border text-[12px]" style={{ borderColor: SUPERFICIE.linha }} role="group" aria-label="Período">
      {opcoes.map((p) => {
        const ativo = p.dias === atual;
        return (
          <Link
            key={p.dias}
            href={`${base}?dias=${p.dias}${extra}`}
            aria-current={ativo ? 'true' : undefined}
            className="px-3 py-1.5 font-medium"
            style={{ background: ativo ? SUPERFICIE.s3 : 'transparent', color: ativo ? TEXTO.t1 : TEXTO.t3, borderBottom: ativo ? `2px solid ${TEMA.marca}` : '2px solid transparent' }}
          >
            {p.rotulo}
          </Link>
        );
      })}
    </div>
  );
}

/** Barra horizontal com valor: proporção legível sem biblioteca de gráfico. */
export function Barra({ fracao, cor = TEMA.marca }: { fracao: number; cor?: string }) {
  const largura = Math.max(0, Math.min(1, fracao)) * 100;
  return (
    <span className="block h-2 w-full overflow-hidden rounded-full" style={{ background: SUPERFICIE.s3 }} aria-hidden="true">
      <span className="block h-full rounded-full" style={{ width: `${largura}%`, minWidth: largura > 0 ? 3 : 0, background: cor }} />
    </span>
  );
}

export const num = (n: number) => n.toLocaleString('pt-BR');

/**
 * Taxa que não mente com amostra pequena: com base zero não há taxa, e abaixo
 * de 30 o número aparece junto com o tamanho da amostra.
 */
export function textoDaTaxa(parte: number, base: number, sufixo = ''): string {
  const t = calcularTaxa(parte, base);
  if (!t.temBase) return 'sem base para comparar';
  const v = `${t.valor.toFixed(t.valor >= 10 || t.valor === 0 ? 0 : 1).replace('.', ',')}%${sufixo}`;
  return t.confiavel ? v : `${v} · amostra pequena (${base})`;
}

/**
 * O funil em barras: cada degrau com a largura proporcional ao primeiro, o
 * número de pessoas e quanto passou do degrau anterior. A passagem com a maior
 * perda (com amostra suficiente) ganha a cor de atenção.
 */
export function FunilDeBarras({ degraus }: { degraus: { rotulo: string; valor: number }[] }) {
  const topo = Math.max(1, ...degraus.map((d) => d.valor));
  let pior = -1;
  let piorTaxa = 101;
  degraus.forEach((d, i) => {
    if (i === 0) return;
    const base = degraus[i - 1].valor;
    if (base < MINIMO_PARA_TAXA) return;
    const t = (100 * d.valor) / base;
    if (t < piorTaxa) {
      piorTaxa = t;
      pior = i;
    }
  });
  return (
    <ol className="space-y-2">
      {degraus.map((d, i) => {
        const ehPior = i === pior;
        return (
          <li key={d.rotulo} className="grid grid-cols-[150px_1fr_64px] items-center gap-3 sm:grid-cols-[180px_1fr_72px_190px]">
            <span className="text-[13px]" style={{ color: TEXTO.t2 }}>{d.rotulo}</span>
            <span className="block h-7 overflow-hidden rounded-[6px]" style={{ background: SUPERFICIE.s2 }} aria-hidden="true">
              <span
                className="block h-full rounded-[6px]"
                style={{
                  width: `${(100 * d.valor) / topo}%`,
                  minWidth: d.valor > 0 ? 4 : 0,
                  background: ehPior ? TEMA.atencao : TEMA.marca,
                  opacity: ehPior ? 1 : 0.35 + 0.65 * (1 - i / Math.max(1, degraus.length - 1)) ,
                }}
              />
            </span>
            <span className="text-right text-[18px] font-semibold tabular-nums" style={{ color: TEXTO.t1 }}>{num(d.valor)}</span>
            <span className="col-span-3 -mt-1 text-[12px] sm:col-span-1 sm:mt-0" style={{ color: ehPior ? TEMA.atencao : TEXTO.t3 }}>
              {i === 0 ? 'pessoas que abriram' : `${textoDaTaxa(d.valor, degraus[i - 1].valor)} do anterior`}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
