'use client';

import { useEffect, useRef } from 'react';

type Props = {
  /** Valor final. */
  ate: number;
  prefixo?: string;
  /** Separador de milhar do português. */
  milhar?: boolean;
  duracao?: number;
};

/**
 * Número que sobe até o valor final quando entra na tela.
 *
 * O valor final já está no HTML servido — a contagem só reescreve o texto
 * depois que o JavaScript assume. Assim o número certo aparece para quem não
 * tem script e para quem lê a página por leitor de tela.
 */
export function Contador({ ate, prefixo = '', milhar = true, duracao = 1500 }: Props) {
  const ref = useRef<HTMLBRElement>(null);

  const formatar = (n: number) =>
    prefixo + (milhar ? n.toLocaleString('pt-BR') : String(n));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !('IntersectionObserver' in window)
    ) {
      return;
    }

    let quadro = 0;
    let rede = 0;

    /**
     * Trava de segurança. Uma contagem interrompida no meio deixa um número
     * ERRADO na tela — "+141 alunos" em vez de "+5.500" — e numa página de
     * venda isso é pior do que não animar. Então qualquer interrupção
     * (aba em segundo plano, rAF estrangulado, desmontagem) termina no valor
     * final, sempre.
     */
    const finalizar = () => {
      if (quadro) cancelAnimationFrame(quadro);
      if (rede) clearTimeout(rede);
      quadro = 0;
      rede = 0;
      el.textContent = formatar(ate);
    };
    const aoTrocarDeAba = () => {
      if (document.hidden) finalizar();
    };

    const io = new IntersectionObserver(
      (entradas) => {
        if (!entradas.some((e) => e.isIntersecting)) return;
        io.disconnect();
        // Aba já em segundo plano: nem começa, só mostra o número certo.
        if (document.hidden) return finalizar();
        const inicio = performance.now();
        const passo = (agora: number) => {
          const t = Math.min(1, (agora - inicio) / duracao);
          // Desacelera no fim para o último dígito "assentar".
          const suave = 1 - Math.pow(1 - t, 3);
          el.textContent = formatar(Math.round(ate * suave));
          if (t < 1) quadro = requestAnimationFrame(passo);
          else finalizar();
        };
        quadro = requestAnimationFrame(passo);
        rede = window.setTimeout(finalizar, duracao + 600);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    document.addEventListener('visibilitychange', aoTrocarDeAba);

    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', aoTrocarDeAba);
      finalizar();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ate, duracao]);

  return <b ref={ref as never}>{formatar(ate)}</b>;
}
