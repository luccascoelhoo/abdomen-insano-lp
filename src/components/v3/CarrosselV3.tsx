'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { IconeSeta } from '@/components/v2/Icones';

type Caso = { src: string; alt: string };

/**
 * Trilho de casos da V.3: o mesmo encaixe nativo do `CarrosselCasos` da V.2
 * (que é da home e não muda), com contador "3/9" e as setas embaixo, fora da
 * foto, pra não cobrirem o antes e depois.
 */
export function CarrosselV3({ casos }: { casos: readonly Caso[] }) {
  const trilho = useRef<HTMLDivElement>(null);
  const [atual, setAtual] = useState(1);

  useEffect(() => {
    const el = trilho.current;
    if (!el) return;
    const itens = Array.from(el.querySelectorAll('figure'));
    // No desktop cabem três fotos inteiras: o contador marca a primeira visível.
    const visiveis = new Set<number>();
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          const n = itens.indexOf(e.target as HTMLElement);
          if (e.isIntersecting) visiveis.add(n);
          else visiveis.delete(n);
        }
        if (visiveis.size) setAtual(Math.min(...visiveis) + 1);
      },
      { root: el, threshold: 0.6 },
    );
    itens.forEach((i) => observador.observe(i));
    return () => observador.disconnect();
  }, []);

  const mover = (direcao: -1 | 1) => {
    const el = trilho.current;
    const item = el?.querySelector('figure');
    if (!el || !item) return;
    el.scrollBy({ left: direcao * (item.getBoundingClientRect().width + 14), behavior: 'smooth' });
  };

  return (
    <div className="v3-carrossel">
      <div className="v2-carrossel__trilho" ref={trilho}>
        {casos.map((c) => (
          <figure key={c.src} className="v2-carrossel__item">
            <Image src={c.src} alt={c.alt} width={1000} height={1000} sizes="(max-width: 720px) 82vw, 320px" />
          </figure>
        ))}
      </div>
      <div className="v3-carrossel__controle">
        <button type="button" onClick={() => mover(-1)} aria-label="Ver anterior">
          <IconeSeta direcao="esq" />
        </button>
        <span>
          {atual}/{casos.length}
        </span>
        <button type="button" onClick={() => mover(1)} aria-label="Ver próximo">
          <IconeSeta direcao="dir" />
        </button>
      </div>
    </div>
  );
}
