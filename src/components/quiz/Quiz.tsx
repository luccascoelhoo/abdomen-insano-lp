'use client';

import type { ReactNode } from 'react';
import { telasQuiz } from '@/content/quiz';
import { useQuiz } from './motor';
import { TELAS } from './telas';

/**
 * Casca do quiz: barra de progresso, voltar e a tela da vez. Quem desenha cada
 * tipo de tela está em `telas/` (registro em `telas/index.tsx`).
 */
export function Quiz({ oferta }: { oferta: ReactNode }) {
  const q = useQuiz(telasQuiz);
  if (!q.pronto) return <main className="quiz" aria-busy="true" />;
  const Componente = TELAS[q.tela.k];
  const semBarra = q.tela.k === 'diagnostico' || q.tela.k === 'plano' || q.tela.k === 'oferta';
  return (
    <main className={`quiz quiz--${q.tela.k}`}>
      {!semBarra && (
        <header className="quiz__topo">
          {q.i > 0 ? (
            <button type="button" className="quiz__voltar" onClick={q.voltar} aria-label="Voltar">
              ←
            </button>
          ) : (
            <span className="quiz__voltar" aria-hidden="true" />
          )}
          <div className="quiz__barra" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(q.progresso * 100)}>
            <span style={{ transform: `scaleX(${q.progresso})` }} />
          </div>
        </header>
      )}
      <div className="quiz__tela" key={q.i}>
        <Componente tela={q.tela} respostas={q.respostas} responder={q.responder} avancar={q.avancar} oferta={oferta} />
      </div>
    </main>
  );
}
