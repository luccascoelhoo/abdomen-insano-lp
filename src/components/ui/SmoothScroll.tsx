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
      // Duração maior = rolagem mais lenta e "cinemática". 1.8 é o ponto onde
      // dá sensação de peso sem parecer travado.
      duration: 1.8,
      // Curva mais suave — começa devagar e desacelera longo no fim.
      easing: (t: number) => 1 - Math.pow(1 - t, 4),
      touchMultiplier: 1.3,
      wheelMultiplier: 0.85,
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
