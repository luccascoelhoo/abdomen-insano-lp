'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { telasQuiz } from '@/content/quiz';
import { useQuiz } from './motor';
import { TELAS } from './telas';

/**
 * Casca do quiz: voltar redondo + barra de progresso em cápsula (como o
 * onboarding do app Flameer) e a tela da vez. Quem desenha cada
 * tipo de tela está em `telas/` (registro em `telas/index.tsx`).
 */
export function Quiz({ oferta }: { oferta: ReactNode }) {
  const q = useQuiz(telasQuiz);

  // Tela nova começa do topo (no celular a anterior pode ter rolado) e o foco
  // vai para o título dela: o botão tocado some, e o leitor de tela se perdia.
  useEffect(() => {
    window.scrollTo(0, 0);
    const titulo = document.querySelector<HTMLElement>('.quiz__tela h1, .quiz__tela h2');
    if (titulo && q.i > 0) {
      titulo.tabIndex = -1;
      titulo.focus({ preventScroll: true });
    }
  }, [q.i]);

  // Para que lado a tela nova entra: da direita ao avançar, da esquerda ao
  // voltar (como o onboarding do app). Guardado no render, sem efeito extra.
  const [anterior, setAnterior] = useState(q.i);
  const [voltando, setVoltando] = useState(false);
  if (q.i !== anterior) {
    setAnterior(q.i);
    setVoltando(q.i < anterior);
  }

  if (!q.pronto) return <main className="quiz" aria-busy="true" />;
  const Componente = TELAS[q.tela.k];
  const semBarra = q.tela.k === 'diagnostico' || q.tela.k === 'plano' || q.tela.k === 'oferta';
  const pct = Math.round(q.progresso * 100);
  return (
    <main className={`quiz quiz--${q.tela.k}${semBarra ? '' : ' quiz--pergunta'}`}>
      {!semBarra && (
        <header className="quiz__topo">
          <div className="quiz__topo-dentro">
            {q.i > 0 ? (
              <button type="button" className="quiz__voltar" onClick={q.voltar} aria-label="Voltar">
                <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
                  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor" />
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
              {q.progresso > 0 && <span style={{ width: `${q.progresso * 100}%` }} />}
            </div>
          </div>
        </header>
      )}
      <div className={`quiz__tela${voltando ? ' quiz__tela--volta' : ''}`} key={q.i}>
        <Componente
          tela={q.tela}
          respostas={q.respostas}
          responder={q.responder}
          avancar={q.avancar}
          irPara={q.irPara}
          recomecar={q.recomecar}
          oferta={oferta}
        />
      </div>
    </main>
  );
}
