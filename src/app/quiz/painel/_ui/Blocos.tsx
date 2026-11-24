import type { ReactNode } from 'react';
import Link from 'next/link';
import { ELEVACAO_CARTAO, SUPERFICIE, TEMA, TEXTO } from '@/lib/painel/tema';

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
  const hora = lidoEm.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' });
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-[22px] font-semibold tracking-[-0.01em]" style={{ color: TEXTO.t1 }}>{titulo}</h1>
        <p className="mt-1 text-[13px]" style={{ color: TEXTO.t3 }}>
          {sub} · <span title="Hora da leitura (Brasília)">lido às {hora}</span>
        </p>
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
