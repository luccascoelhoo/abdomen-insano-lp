'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * O mecanismo da página desenhado: seis gomos debaixo de uma capa que seca
 * quando o desenho entra na tela. A capa não some de uma vez, ela afina, que é
 * o que acontece de verdade.
 *
 * Quem pediu menos movimento no sistema vê a troca sem transição (v3.css).
 */
export function CapaDesenho({ com, sem }: { com: string; sem: string }) {
  const caixa = useRef<HTMLDivElement>(null);
  const [seca, setSeca] = useState(false);

  useEffect(() => {
    const el = caixa.current;
    if (!el) return;
    const observador = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeca(true);
          observador.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  return (
    <div
      ref={caixa}
      className={`v3-capa${seca ? ' is-seca' : ''}`}
      role="img"
      aria-label="Seis gomos do abdômen ficando visíveis conforme a capa de gordura seca"
    >
      <div className="v3-capa__gomos" aria-hidden="true">
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} />
        ))}
      </div>
      <div className="v3-capa__gordura" aria-hidden="true" />
      <p className="v3-capa__rotulo" aria-hidden="true">
        <span className="v3-capa__rotulo-com">{com}</span>
        <span className="v3-capa__rotulo-sem">{sem}</span>
      </p>
    </div>
  );
}
