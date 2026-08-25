'use client';

import { useEffect } from 'react';

/**
 * Rolagem suave com inércia (Lenis) — só no desktop.
 *
 * Substitui o `scroll-behavior: smooth` do CSS, que só afeta clique em âncora
 * e não dá controle nenhum sobre a curva. Aqui a rolagem inteira passa a ter
 * amortecimento — é o que separa uma página que "pula" de uma que desliza.
 *
 * No mobile o scroll nativo do iOS/Android já é suave (inércia do sistema);
 * carregar Lenis lá é ~30KB de JS + rAF perpétuo pra ganho zero — e ainda
 * pode brigar com o momentum do dedo. Por isso o import é dinâmico e a
 * biblioteca só desce pra máquinas com hover/mouse.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;
    if (window.innerWidth < 900) return;

    let ativo = true;
    let frame = 0;
    let destruir: (() => void) | null = null;

    import('lenis').then(({ default: Lenis }) => {
      if (!ativo) return;
      // Config leve: duration menor (0.9) e wheelMultiplier em 1.0 pra não
      // "sentir enrolado" no trackpad. Ainda dá o deslize com amortecimento,
      // mas sem jank de frame.
      const lenis = new Lenis({
        duration: 0.9,
        easing: (t: number) => 1 - Math.pow(1 - t, 3),
        touchMultiplier: 1.2,
        wheelMultiplier: 1.0,
      });

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

      const loop = (tempo: number) => {
        lenis.raf(tempo);
        frame = requestAnimationFrame(loop);
      };
      frame = requestAnimationFrame(loop);

      destruir = () => {
        document.removeEventListener('click', aoClicar);
        cancelAnimationFrame(frame);
        lenis.destroy();
      };
    });

    return () => {
      ativo = false;
      destruir?.();
    };
  }, []);

  return null;
}
