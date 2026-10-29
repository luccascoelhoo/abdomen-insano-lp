'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { IconeSeta } from './Icones';

type Caso = { src: string; alt: string };

/**
 * Trilho de antes e depois com rolagem nativa (dedo no celular, setas no
 * desktop). Sem biblioteca de carrossel: `scroll-snap` faz o encaixe.
 */
export function CarrosselCasos({ casos }: { casos: readonly Caso[] }) {
  const trilho = useRef<HTMLDivElement>(null);

  const mover = (direcao: -1 | 1) => {
    const el = trilho.current;
    if (!el) return;
    const item = el.querySelector('figure');
    const passo = item ? item.getBoundingClientRect().width + 14 : el.clientWidth * 0.8;
    el.scrollBy({ left: direcao * passo, behavior: 'smooth' });
  };

  return (
    <div className="v2-carrossel">
      <button type="button" className="v2-carrossel__seta v2-carrossel__seta--esq" onClick={() => mover(-1)} aria-label="Ver anterior">
        <IconeSeta direcao="esq" />
      </button>
      <div className="v2-carrossel__trilho" ref={trilho}>
        {casos.map((c) => (
          <figure key={c.src} className="v2-carrossel__item">
            <Image src={c.src} alt={c.alt} width={1000} height={1000} sizes="(max-width: 720px) 80vw, 320px" />
          </figure>
        ))}
      </div>
      <button type="button" className="v2-carrossel__seta v2-carrossel__seta--dir" onClick={() => mover(1)} aria-label="Ver próximo">
        <IconeSeta direcao="dir" />
      </button>
    </div>
  );
}
