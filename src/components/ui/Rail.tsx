'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Trilho horizontal arrastável.
 *
 * Substitui o mosaico de 10 fotos empilhadas: prova social vira uma fita que
 * a pessoa puxa com o dedo (ou com o mouse, arrastando). Ocupa menos altura,
 * convida ao toque e é o que sites de esporte fazem com galeria.
 *
 * Sem JavaScript continua sendo uma faixa com rolagem horizontal nativa.
 */
export function Rail({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let arrastando = false;
    let xInicial = 0;
    let rolagemInicial = 0;

    const comecar = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return; // o toque já rola nativamente
      arrastando = true;
      xInicial = e.clientX;
      rolagemInicial = el.scrollLeft;
      el.setPointerCapture(e.pointerId);
    };
    const mover = (e: PointerEvent) => {
      if (!arrastando) return;
      el.scrollLeft = rolagemInicial - (e.clientX - xInicial);
    };
    const soltar = (e: PointerEvent) => {
      arrastando = false;
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    };

    el.addEventListener('pointerdown', comecar);
    el.addEventListener('pointermove', mover);
    el.addEventListener('pointerup', soltar);
    el.addEventListener('pointercancel', soltar);
    return () => {
      el.removeEventListener('pointerdown', comecar);
      el.removeEventListener('pointermove', mover);
      el.removeEventListener('pointerup', soltar);
      el.removeEventListener('pointercancel', soltar);
    };
  }, []);

  return (
    <div className="rail" ref={ref}>
      {children}
    </div>
  );
}
