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
};

/**
 * Revela o conteúdo quando ele entra na tela.
 *
 * O estado escondido vive em `html[data-js] .rv` (ver globals.css), nunca em
 * estilo inline — assim o HTML entregue pelo servidor já é legível e a página
 * continua inteira mesmo se o JavaScript falhar.
 */
export function Reveal({ children, as: Tag = 'div', className, delay = 0, style }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (semMovimento || !('IntersectionObserver' in window)) {
      el.classList.add('in');
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const alvo = entry.target as HTMLElement;
          window.setTimeout(() => alvo.classList.add('in'), delay);
          io.unobserve(alvo);
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  return (
    <Tag ref={ref} className={className ? `rv ${className}` : 'rv'} style={style}>
      {children}
    </Tag>
  );
}
