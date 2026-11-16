'use client';

import { useEffect } from 'react';
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

  // Tela nova começa do topo (no celular a anterior pode ter rolado).
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [q.i]);

  if (!q.pronto) return <main className="quiz" aria-busy="true" />;
  const Componente = TELAS[q.tela.k];
  const semBarra = q.tela.k === 'diagnostico' || q.tela.k === 'plano' || q.tela.k === 'oferta';
  const pct = Math.round(q.progresso * 100);
  return (
    <main className={`quiz quiz--${q.tela.k}`}>
      {!semBarra && (
        <header className="quiz__topo">
          <div className="quiz__topo-dentro">
            {q.i > 0 ? (
              <button type="button" className="quiz__voltar" onClick={q.voltar} aria-label="Voltar">
                <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
                  <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ) : (
              <span className="quiz__voltar" aria-hidden="true" />
            )}
            <div
              className="quiz__barra"
              role="progressbar"
              aria-label="Progresso do quiz"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={pct}
            >
              <span style={{ transform: `scaleX(${q.progresso})` }} />
            </div>
          </div>
        </header>
      )}
      <div className="quiz__tela" key={q.i}>
        <Componente tela={q.tela} respostas={q.respostas} responder={q.responder} avancar={q.avancar} oferta={oferta} />
      </div>
    </main>
  );
}
