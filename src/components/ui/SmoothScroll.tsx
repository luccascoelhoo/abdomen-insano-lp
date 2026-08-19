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
    // TESTE DE JANK — desligado unconditionally pra confirmar se o Lenis é o
    // culpado do frame drop no trackpad. Se sim, decidir: remover de vez ou
    // voltar com config mais leve (duration 0.8, wheelMultiplier 1.0).
    return;
    // eslint-disable-next-line no-unreachable
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;
    if (window.innerWidth < 900) return;

    let ativo = true;
    let frame = 0;
    let destruir: (() => void) | null = null;

    import('lenis').then(({ default: Lenis }) => {
      if (!ativo) return;
      const lenis = new Lenis({
        duration: 1.8,
        easing: (t: number) => 1 - Math.pow(1 - t, 4),
        touchMultiplier: 1.3,
        wheelMultiplier: 0.85,
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
