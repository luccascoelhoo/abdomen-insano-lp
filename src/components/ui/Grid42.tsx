'use client';

import { useEffect, useRef } from 'react';

const DIAS = Array.from({ length: 42 }, (_, i) => i + 1);
const PASSO_MS = 52;

/**
 * A malha dos 42 dias — o elemento assinatura da página.
 *
 * Sem JavaScript, as 42 células nascem preenchidas (estado final). Com
 * JavaScript, nascem vazias e preenchem uma a uma quando a malha entra na
 * tela. Decorativa: o texto está no rodapé da caixa, então `aria-hidden`.
 */
export function Grid42() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const celulas = Array.from(el.querySelectorAll<HTMLElement>('.c'));
    const preencher = () => celulas.forEach((c) => c.classList.add('on'));

    const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (semMovimento || !('IntersectionObserver' in window)) {
      preencher();
      return;
    }

    const timers: number[] = [];
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        celulas.forEach((c, i) => {
          timers.push(window.setTimeout(() => c.classList.add('on'), i * PASSO_MS + 300));
        });
      },
      { threshold: 0.2 },
    );

    io.observe(el);
    return () => {
      io.disconnect();
      timers.forEach(window.clearTimeout);
    };
  }, []);

  return (
    <div className="grid42" ref={ref} aria-hidden="true">
      {DIAS.map((dia) => (
        <span key={dia} className={dia === 42 ? 'c c--last' : 'c'}>
          {String(dia).padStart(2, '0')}
        </span>
      ))}
    </div>
  );
}
