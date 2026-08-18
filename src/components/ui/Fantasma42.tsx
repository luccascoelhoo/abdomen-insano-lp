'use client';

import { useEffect, useRef } from 'react';

/**
 * Numeral "42" gigante sangrando pela direita do hero, com parallax lento.
 *
 * O movimento é uma fração da rolagem — o "42" sobe mais devagar que o resto,
 * criando profundidade de campo sem chamar atenção pra si.
 */
export function Fantasma42() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let pedido = 0;
    const aplicar = () => {
      pedido = 0;
      // Sobe até 25% da rolagem: numa tela cheia (900px) desloca ~225px.
      const y = -window.scrollY * 0.25;
      el.style.transform = `translate3d(0, ${y}px, 0)`;
    };
    const aoRolar = () => {
      if (pedido) return;
      pedido = requestAnimationFrame(aplicar);
    };
    aplicar();
    window.addEventListener('scroll', aoRolar, { passive: true });
    return () => {
      window.removeEventListener('scroll', aoRolar);
      if (pedido) cancelAnimationFrame(pedido);
    };
  }, []);

  return (
    <div className="hero__fantasma" aria-hidden="true" ref={ref}>
      42
    </div>
  );
}
