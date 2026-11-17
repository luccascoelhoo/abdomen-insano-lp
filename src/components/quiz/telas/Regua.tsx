'use client';

import { useMemo, useRef } from 'react';
import type { KeyboardEvent } from 'react';
import { useRolo } from './rolo';

/** Distância entre dois traços (`tickSpacing` do `RulerPicker` do app). */
const ESPACO = 14;

interface PropsRegua {
  valor: number;
  min: number;
  max: number;
  unidade: string;
  /** Nome do controle para o leitor de tela. */
  rotulo: string;
  /** Leitura falada do valor (ex.: "175 centímetros"). */
  falar?: (v: number) => string;
  aoMudar: (v: number) => void;
}

/**
 * A régua do app (`RulerPicker`, ComponentesDoCadastro.kt) na web: número
 * grande + unidade e, embaixo, uma fita que rola na horizontal com um traço por
 * unidade (passo 1), traço maior a cada 5 e rótulo a cada 10. A agulha fica
 * parada no meio; o valor é o traço que está debaixo dela.
 */
export function Regua({ valor, min, max, unidade, rotulo, falar, aoMudar }: PropsRegua) {
  const total = max - min + 1;
  const { ref, irPara, atual } = useRolo({
    eixo: 'x',
    passo: ESPACO,
    indice: valor - min,
    total,
    aoMudar: (i) => aoMudar(min + i),
    vibrar: true,
  });
  const trilho = useRef<HTMLDivElement>(null);
  const tracos = useMemo(() => Array.from({ length: total }, (_, i) => min + i), [min, total]);

  const teclar = (e: KeyboardEvent) => {
    const passos: Record<string, number> = {
      ArrowLeft: -1,
      ArrowDown: -1,
      ArrowRight: 1,
      ArrowUp: 1,
      PageDown: -10,
      PageUp: 10,
      Home: -total,
      End: total,
    };
    if (!(e.key in passos)) return;
    e.preventDefault();
    irPara(atual() + passos[e.key]);
  };

  return (
    <div className="qc-regua">
      <p className="qc-regua__leitura" aria-hidden="true">
        <span className="qc-regua__valor">{valor}</span>
        <span className="qc-regua__unidade">{unidade}</span>
      </p>
      <div
        ref={trilho}
        className="qc-regua__trilho"
        role="slider"
        tabIndex={0}
        aria-label={rotulo}
        aria-orientation="horizontal"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={valor}
        aria-valuetext={falar ? falar(valor) : `${valor} ${unidade}`}
        onKeyDown={teclar}
        onMouseDown={(e) => {
          // O foco vai para o controle (teclado depois do clique), não para o rolo.
          e.preventDefault();
          trilho.current?.focus({ preventScroll: true });
        }}
      >
        <div ref={ref} className="qc-regua__rolo" tabIndex={-1}>
          <span className="qc-regua__borda" />
          {tracos.map((v) => (
            <span
              key={v}
              className={`qc-regua__traco${v % 10 === 0 ? ' qc-regua__traco--10' : v % 5 === 0 ? ' qc-regua__traco--5' : ''}`}
            >
              {v % 10 === 0 && <span className="qc-regua__num">{v}</span>}
            </span>
          ))}
          <span className="qc-regua__borda" />
        </div>
        <span className="qc-regua__agulha" aria-hidden="true" />
      </div>
    </div>
  );
}
