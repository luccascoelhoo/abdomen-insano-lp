'use client';

import { useEffect, useRef, type ElementType, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  /** Elemento renderizado. Padrão `div`. */
  as?: ElementType;
  className?: string;
  /** Atraso em ms depois de entrar na tela. */
  delay?: number;
  style?: React.CSSProperties;
  /**
   * Se true (padrão), a animação refaz toda vez que o elemento entra na tela
   * — inclusive rolando pra cima. Se false, dispara uma vez e trava.
   */
  reanima?: boolean;
};

/**
 * Revela o conteúdo quando ele entra na tela — e desfaz quando sai, refazendo
 * ao entrar de novo. Isso dá a sensação de que a página "respira" no scroll
 * bidirecional em vez de virar um sequência de peças que só existem depois
 * de vistas uma vez.
 *
 * O estado escondido vive em `html[data-js] .rv` (globals.css), nunca em
 * estilo inline — assim o HTML entregue pelo servidor já é legível e a
 * página continua inteira mesmo sem JavaScript.
 */
export function Reveal({
  children,
  as: Tag = 'div',
  className,
  delay = 0,
  style,
  reanima = true,
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (semMovimento || !('IntersectionObserver' in window)) {
      el.classList.add('in');
      return;
    }

    let pendente = 0;

    const io = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          const alvo = entrada.target as HTMLElement;
          if (entrada.isIntersecting) {
            if (pendente) window.clearTimeout(pendente);
            pendente = window.setTimeout(() => {
              alvo.classList.remove('out');
              alvo.classList.add('in');
            }, delay);
            if (!reanima) io.unobserve(alvo);
          } else if (reanima) {
            if (pendente) window.clearTimeout(pendente);
            alvo.classList.remove('in');
            alvo.classList.add('out');
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    );

    io.observe(el);
    return () => {
      io.disconnect();
      if (pendente) window.clearTimeout(pendente);
    };
  }, [delay, reanima]);

  return (
    <Tag ref={ref} className={className ? `rv ${className}` : 'rv'} style={style}>
      {children}
    </Tag>
  );
}
