'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { AntesDepois } from './AntesDepois';

type Caso = { src: string; alt: string };

/** Encostou: dá uma pausa de 7 s antes de voltar a passar sozinho. */
function adiar(ref: { current: number }) {
  ref.current = Date.now() + 7000;
}

/**
 * Antes e depois em slideshow: os alunos passam sozinhos, de lado, e a pessoa
 * também pode arrastar. Rolagem nativa com `scroll-snap` (sem biblioteca).
 *
 * Passa sozinho só enquanto está na tela e a aba está aberta; para quando a
 * pessoa encosta, e volta depois de alguns segundos parada. Com "reduzir
 * movimento" ligado não anda sozinho.
 */
export function SlideshowAntesDepois({
  casos,
  legenda,
  intervaloMs = 3800,
}: {
  casos: readonly Caso[];
  legenda?: ReactNode;
  intervaloMs?: number;
}) {
  const trilho = useRef<HTMLDivElement>(null);
  const visivel = useRef(false);
  const pausaAte = useRef(0);
  const [ativo, setAtivo] = useState(0);

  const indiceAtual = useCallback(() => {
    const el = trilho.current;
    return el && el.clientWidth ? Math.round(el.scrollLeft / el.clientWidth) : 0;
  }, []);

  const ir = useCallback((i: number) => {
    const el = trilho.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' });
  }, []);

  // Só anda sozinho quando o trilho está na tela.
  useEffect(() => {
    const el = trilho.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver(([e]) => (visivel.current = e.isIntersecting), { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (casos.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => {
      if (!visivel.current || document.hidden || Date.now() < pausaAte.current) return;
      ir((indiceAtual() + 1) % casos.length);
    }, intervaloMs);
    return () => window.clearInterval(id);
  }, [casos.length, intervaloMs, ir, indiceAtual]);

  // Pontinhos: acompanha a rolagem (do dedo ou do automático).
  const aoRolar = () => setAtivo(indiceAtual());

  return (
    <div className="slideshow" onPointerDown={() => adiar(pausaAte)} onKeyDown={() => adiar(pausaAte)}>
      <div className="slideshow__trilho" ref={trilho} onScroll={aoRolar} tabIndex={0} aria-label="Alunos do desafio: antes e depois">
        {casos.map((c, i) => (
          <div className="slideshow__slide" key={c.src} aria-hidden={i !== ativo}>
            <AntesDepois src={c.src} alt={c.alt} />
          </div>
        ))}
      </div>
      <div className="slideshow__pontos" role="group" aria-label="Escolher aluno">
        {casos.map((c, i) => (
          <button
            key={c.src}
            type="button"
            className={`slideshow__ponto${i === ativo ? ' slideshow__ponto--ativo' : ''}`}
            aria-label={`Ver aluno ${i + 1} de ${casos.length}`}
            aria-current={i === ativo}
            onClick={() => {
              adiar(pausaAte);
              ir(i);
            }}
          />
        ))}
      </div>
      {legenda && <p className="slideshow__legenda">{legenda}</p>}
    </div>
  );
}
