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
import Lenis from 'lenis';

export function SmoothScroll() {
  useEffect(() => {
    // A pedido do usuário, estamos voltando com o Lenis para dar aquela
    // suavidade premium no scroll do desktop.
    if (window.matchMedia('(max-width: 899px)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.06, // Menor o valor, mais longa e "amanteigada" é a inércia (padrão é ~0.1)
      wheelMultiplier: 0.8, // Diminui de leve o passo do scroll pra dar peso
      smoothWheel: true,
    });

    return () => {
      lenis.destroy();
    };
  }, []);

  return null;
}
