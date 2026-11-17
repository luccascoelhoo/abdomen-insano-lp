'use client';

import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import type { KeyboardEvent } from 'react';
import { useRolo } from './rolo';

/* ------------------------------------------------------------ datas 'AAAA-MM-DD' */

export const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

export const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;
const dois = (n: number) => String(n).padStart(2, '0');

export const isoDe = (a: number, m: number, d: number) => `${a}-${dois(m)}-${dois(d)}`;

export function partes(iso: string): [number, number, number] {
  const m = ISO.exec(iso);
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : [2000, 6, 15];
}

export const diasNoMes = (a: number, m: number) => new Date(Date.UTC(a, m, 0)).getUTCDate();

/** Hoje em Brasília (o fuso do produto, o mesmo de `idade()` e `diasAte()`). */
export const hojeSP = (agora = new Date()) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(agora);

export function somarDias(iso: string, n: number): string {
  const [a, m, d] = partes(iso);
  const t = new Date(Date.UTC(a, m - 1, d + n));
  return isoDe(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate());
}

/** "15 de junho de 1995". */
export function porExtenso(iso: string): string {
  const [a, m, d] = partes(iso);
  return `${d} de ${MESES[m - 1]} de ${a}`;
}

/* -------------------------------------------------------------------- a roda */

/** Altura de uma linha. A janela mostra 5 (a do meio é a escolhida). */
const LINHA = 40;

interface Item {
  v: number;
  rotulo: string;
}

function Coluna({
  itens,
  valor,
  rotulo,
  pagina,
  aoMudar,
}: {
  itens: Item[];
  valor: number;
  rotulo: string;
  /** Quanto PageUp/PageDown anda. */
  pagina: number;
  aoMudar: (v: number) => void;
}) {
  const indice = Math.max(0, itens.findIndex((it) => it.v === valor));
  const { ref, irPara, atual, foiArrasto } = useRolo({
    eixo: 'y',
    passo: LINHA,
    indice,
    total: itens.length,
    aoMudar: (i) => aoMudar(itens[Math.min(i, itens.length - 1)].v),
  });

  // spinbutton: ↑ aumenta (o próximo item), ↓ diminui.
  const teclar = (e: KeyboardEvent) => {
    const passos: Record<string, number> = {
      ArrowUp: 1,
      ArrowDown: -1,
      PageUp: pagina,
      PageDown: -pagina,
      Home: -itens.length,
      End: itens.length,
    };
    if (!(e.key in passos)) return;
    e.preventDefault();
    irPara(atual() + passos[e.key]);
  };

  return (
    <div
      className="qc-roda__coluna"
      role="spinbutton"
      tabIndex={0}
      aria-label={rotulo}
      aria-valuenow={valor}
      aria-valuetext={itens[indice]?.rotulo}
      aria-valuemin={itens[0]?.v}
      aria-valuemax={itens[itens.length - 1]?.v}
      onKeyDown={teclar}
      onMouseDown={(e) => {
        e.preventDefault();
        e.currentTarget.focus({ preventScroll: true });
      }}
    >
      <div ref={ref} className="qc-roda__rolo" tabIndex={-1}>
        <div className="qc-roda__borda" />
        {itens.map((it, i) => (
          <div
            key={it.v}
            className={`qc-roda__item${i === indice ? ' qc-roda__item--atual' : ''}`}
            onClick={() => {
              if (!foiArrasto()) irPara(i, true);
            }}
          >
            {it.rotulo}
          </div>
        ))}
        <div className="qc-roda__borda" />
      </div>
    </div>
  );
}

interface PropsRoda {
  /** 'AAAA-MM-DD'. */
  valor: string;
  aoMudar: (iso: string) => void;
  anoMin: number;
  anoMax: number;
  /** Faixa aceita ('AAAA-MM-DD'). Fora dela, a roda volta sozinha (como no iOS). */
  minimo?: string;
  maximo?: string;
  /** Nome do grupo para o leitor de tela. */
  rotulo: string;
}

/**
 * A roda de datas do app (DatePicker `.wheel` do iOS): dia / mês / ano, cada um
 * uma coluna com encaixe, 5 linhas visíveis, a do meio sobre uma faixa
 * arredondada. O dia se ajusta ao tamanho do mês (31 → 30 em abril; 29/02 só
 * em ano bissexto).
 */
export function RodaDeDatas({ valor, aoMudar, anoMin, anoMax, minimo, maximo, rotulo }: PropsRoda) {
  const [a, m, d] = partes(valor);

  const dias = useMemo(
    () => Array.from({ length: diasNoMes(a, m) }, (_, i) => ({ v: i + 1, rotulo: String(i + 1) })),
    [a, m],
  );
  const meses = useMemo(() => MESES.map((nome, i) => ({ v: i + 1, rotulo: nome })), []);
  const anos = useMemo(
    () => Array.from({ length: anoMax - anoMin + 1 }, (_, i) => ({ v: anoMin + i, rotulo: String(anoMin + i) })),
    [anoMin, anoMax],
  );

  const mudar = (na: number, nm: number, nd: number) => {
    const iso = isoDe(na, nm, Math.min(nd, diasNoMes(na, nm)));
    if (iso !== valor) aoMudar(iso);
  };

  // Fora da faixa: espera o giro assentar e devolve para a data aceita mais perto.
  const limitado = minimo && valor < minimo ? minimo : maximo && valor > maximo ? maximo : valor;
  const aoMudarVivo = useRef(aoMudar);
  useLayoutEffect(() => {
    aoMudarVivo.current = aoMudar;
  });
  useEffect(() => {
    if (limitado === valor) return;
    const t = window.setTimeout(() => aoMudarVivo.current(limitado), 450);
    return () => window.clearTimeout(t);
  }, [valor, limitado]);

  return (
    <div className="qc-roda" role="group" aria-label={rotulo}>
      <div className="qc-roda__janela">
        <div className="qc-roda__faixa" aria-hidden="true" />
        <Coluna itens={dias} valor={d} rotulo="Dia" pagina={7} aoMudar={(v) => mudar(a, m, v)} />
        <Coluna itens={meses} valor={m} rotulo="Mês" pagina={3} aoMudar={(v) => mudar(a, v, d)} />
        <Coluna itens={anos} valor={a} rotulo="Ano" pagina={10} aoMudar={(v) => mudar(v, m, d)} />
      </div>
    </div>
  );
}
