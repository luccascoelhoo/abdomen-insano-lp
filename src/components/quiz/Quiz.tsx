'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { telasQuiz } from '@/content/quiz';
import { progressoPersuasivo } from './calculos';
import { useQuiz } from './motor';
import { TELAS } from './telas';
import { enviarEventoQuiz } from '@/lib/quiz-evento';

/**
 * Casca do quiz: voltar redondo + barra de progresso em cápsula (como o
 * onboarding do app Flameer) e a tela da vez. Quem desenha cada
 * tipo de tela está em `telas/` (registro em `telas/index.tsx`).
 */
export function Quiz({ oferta }: { oferta: ReactNode }) {
  const q = useQuiz(telasQuiz);

  // Funil: uma tela vista = um evento anônimo, com o tempo gasto na anterior.
  const ultima = useRef<{ i: number; t: number } | null>(null);
  useEffect(() => {
    if (!q.pronto) return;
    const agora = Date.now();
    const ant = ultima.current;
    if (ant && ant.i === q.i) return;
    const t = telasQuiz[q.i];
    const id = 'chave' in t && t.chave ? String(t.chave) : t.k;
    enviarEventoQuiz({
      evento: ant && q.i < ant.i ? 'voltar' : 'view',
      indice: q.i,
      tela: id,
      indiceAnterior: ant?.i,
      msAnterior: ant ? agora - ant.t : undefined,
      origem: window.location.hostname.startsWith('quiz.') ? 'quiz-subdominio' : 'www',
    });
    ultima.current = { i: q.i, t: agora };
  }, [q.i, q.pronto]);

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
  const semBarra = ['diagnostico', 'projecao', 'plano', 'desconto', 'oferta'].includes(q.tela.k);
  // Barra persuasiva: começa rápido e desacelera (ver `progressoPersuasivo`).
  const visual = progressoPersuasivo(q.progresso);
  const pct = Math.round(visual * 100);
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
              <span style={{ width: `${visual * 100}%` }} />
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
