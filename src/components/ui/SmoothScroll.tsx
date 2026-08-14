'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

/**
 * Rolagem suave com inércia (Lenis).
 *
 * Substitui o `scroll-behavior: smooth` do CSS, que só afeta clique em âncora
 * e não dá controle nenhum sobre a curva. Aqui a rolagem inteira passa a ter
 * amortecimento — é o que separa uma página que "pula" de uma que desliza.
 *
 * Também é o relógio das animações ligadas à rolagem: quem quiser reagir ao
 * progresso escuta o evento `lenis-scroll`.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      duration: 1.05,
      // Curva de desaceleração: rápida no começo, longa no fim.
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 1.6,
    });

    // Clique em âncora (#oferta) passa a ser conduzido pelo Lenis.
    const aoClicar = (evento: MouseEvent) => {
      const alvo = (evento.target as HTMLElement | null)?.closest('a[href^="#"]');
      if (!alvo) return;
      const id = alvo.getAttribute('href');
      if (!id || id === '#') return;
      const destino = document.querySelector(id);
      if (!destino) return;
      evento.preventDefault();
      lenis.scrollTo(destino as HTMLElement, { offset: -20, duration: 1.4 });
    };
    document.addEventListener('click', aoClicar);

    let frame = 0;
    const loop = (tempo: number) => {
      lenis.raf(tempo);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    return () => {
      document.removeEventListener('click', aoClicar);
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  return null;
}
