'use client';

import { useEffect, useRef } from 'react';
import { semanas } from '@/content/desafio';

/** A intensidade cresce semana a semana — mesma escala do desenho original. */
const PESO = [0.32, 0.46, 0.58, 0.72, 0.86, 1];

/**
 * A linha do tempo das 6 semanas.
 *
 * Cada linha acende sozinha quando entra na tela, uma depois da outra: a
 * barra de 7 dias cresce da esquerda. Como o gatilho é por linha (e não pelo
 * bloco inteiro), a leitura acompanha a rolagem em vez de tudo aparecer junto.
 */
export function Semanas() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const linhas = Array.from(el.querySelectorAll<HTMLElement>('.semana'));

    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !('IntersectionObserver' in window)
    ) {
      linhas.forEach((l) => l.classList.add('in'));
      return;
    }

    const io = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (!entrada.isIntersecting) continue;
          entrada.target.classList.add('in');
          io.unobserve(entrada.target);
        }
      },
      { threshold: 0.5, rootMargin: '0px 0px -10% 0px' },
    );
    linhas.forEach((l) => io.observe(l));
    return () => io.disconnect();
  }, []);

  return (
    <div className="semanas" ref={ref}>
      {semanas.map((semana, i) => (
        <div
          className={i === semanas.length - 1 ? 'semana semana--fim' : 'semana'}
          key={semana.rotulo}
        >
          <span className="semana__n">{semana.rotulo.replace('Semana ', '')}</span>
          <h4>{semana.titulo}</h4>
          <div
            className="semana__barra"
            aria-hidden="true"
            style={{ ['--peso' as string]: PESO[i] }}
          />
        </div>
      ))}
    </div>
  );
}
