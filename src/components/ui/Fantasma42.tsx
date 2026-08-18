'use client';

import { useEffect, useRef } from 'react';

/**
 * Numeral "42" gigante sangrando pela direita do hero, com parallax lento.
 *
 * O movimento é uma fração da rolagem — o "42" sobe mais devagar que o resto,
 * criando profundidade de campo sem chamar atenção pra si.
 *
 * Só escuta scroll enquanto está visível. Assim que sai do viewport (o hero
 * some), remove o listener — não faz sentido recalcular parallax de um
 * elemento que ninguém vai ver.
 */
export function Fantasma42() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let pedido = 0;
    let visivel = true;
    const aplicar = () => {
      pedido = 0;
      const y = -window.scrollY * 0.25;
      el.style.transform = `translate3d(0, ${y}px, 0)`;
    };
    const aoRolar = () => {
      if (pedido || !visivel) return;
      pedido = requestAnimationFrame(aplicar);
    };
    aplicar();
    window.addEventListener('scroll', aoRolar, { passive: true });

    // Pausa o listener quando o hero some — margem generosa pra reativar cedo.
    const io = new IntersectionObserver(
      ([entrada]) => {
        visivel = entrada.isIntersecting;
      },
      { rootMargin: '200px 0px' },
    );
    io.observe(el);

    return () => {
      window.removeEventListener('scroll', aoRolar);
      io.disconnect();
      if (pedido) cancelAnimationFrame(pedido);
    };
  }, []);

  return (
    <div className="hero__fantasma" aria-hidden="true" ref={ref}>
      42
    </div>
  );
}
