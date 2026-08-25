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
    // Rolagem suave nativa via CSS. Lenis foi removido porque conflita com o
    // pin horizontal dos Depoimentos (o listener de window.scroll do pin
    // recebia posições dessincronizadas do scroll virtual do Lenis).
    // Modernos navegadores (>= 2020) já dão inércia de trackpad/mouse boa
    // o suficiente sem lib extra.
    const html = document.documentElement;
    const anterior = html.style.scrollBehavior;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      html.style.scrollBehavior = 'auto';
    } else {
      html.style.scrollBehavior = 'smooth';
    }
    return () => {
      html.style.scrollBehavior = anterior;
    };
  }, []);

  return null;
}
