'use client';

import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

type Props = {
  /** Uma entrada por linha do título. */
  linhas: readonly ReactNode[];
  className?: string;
  as?: 'h1' | 'h2' | 'p';
  /**
   * Classe por linha, na mesma ordem de `linhas` — é assim que uma linha do
   * cartaz fica mais estreita ou laranja que a de cima.
   * Array (e não função) porque isto atravessa a fronteira servidor→cliente.
   */
  classesLinha?: readonly (string | undefined)[];
  /** Se true (padrão), refaz a animação toda vez que entra na tela. */
  reanima?: boolean;
};

/**
 * Título que sobe por trás de uma máscara, linha a linha.
 *
 * É a diferença entre um texto que "aparece" e um que entra em cena: cada
 * linha nasce embaixo do próprio recorte e desliza para o lugar, com atraso
 * entre elas. Sem JavaScript, o CSS da máscara nem existe e o título já está
 * no lugar.
 *
 * Modo `reanima` (padrão): quando o título sai da tela, ele volta pro estado
 * escondido, e refaz a entrada se rolar de volta. Faz a página respirar.
 */
export function MaskTitle({
  linhas,
  className,
  as: Tag = 'h2',
  classesLinha,
  reanima = true,
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const partes = Array.from(el.querySelectorAll<HTMLElement>('.mask'));

    const revelar = () => partes.forEach((p) => p.classList.add('in'));
    const esconder = () => partes.forEach((p) => p.classList.remove('in'));

    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !('IntersectionObserver' in window)
    ) {
      revelar();
      return;
    }

    const io = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (entrada.isIntersecting) {
            revelar();
            if (!reanima) io.disconnect();
          } else if (reanima) {
            esconder();
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -6% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reanima]);

  return (
    <Tag ref={ref as never} className={className}>
      {linhas.map((linha, i) => (
        <span className="mask" key={i}>
          <span
            className={classesLinha?.[i]}
            style={{ transitionDelay: `${i * 110}ms` }}
          >
            {linha}
          </span>
        </span>
      ))}
    </Tag>
  );
}
