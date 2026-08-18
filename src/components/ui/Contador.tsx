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
 * Número que sobe até o valor final toda vez que entra na tela.
 *
 * Se você rolar pra cima e voltar, ele conta de novo — a página respira em
 * scroll bidirecional em vez de virar peça estática. O valor final já está
 * no HTML servido, então quem não tem script ou leitor de tela recebe o
 * número certo direto.
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
      el.textContent = formatar(ate);
      return;
    }

    let quadro = 0;
    let rede = 0;

    /**
     * Trava de segurança: qualquer interrupção (aba em segundo plano, rAF
     * estrangulado, unmount) resolve no valor final. Uma contagem parada no
     * meio deixa "+141 alunos" em vez de "+5.500" — pior que não animar.
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

    const iniciar = () => {
      if (document.hidden) return finalizar();
      const inicio = performance.now();
      const passo = (agora: number) => {
        const t = Math.min(1, (agora - inicio) / duracao);
        const suave = 1 - Math.pow(1 - t, 3);
        el.textContent = formatar(Math.round(ate * suave));
        if (t < 1) quadro = requestAnimationFrame(passo);
        else finalizar();
      };
      quadro = requestAnimationFrame(passo);
      rede = window.setTimeout(finalizar, duracao + 600);
    };

    const io = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (entrada.isIntersecting) {
            // Cada nova entrada recomeça a contagem — o primeiro frame do rAF
            // já reescreve pra 0, então não precisa "zerar" antes (evita o
            // piscar de 0 enquanto o elemento ainda está desmontado da tela).
            iniciar();
          } else {
            // Saiu completamente da tela: reseta o valor pra próxima entrada
            // começar do zero. Como o elemento não está visível nesse momento,
            // a mudança não pisca.
            if (quadro) cancelAnimationFrame(quadro);
            if (rede) clearTimeout(rede);
            quadro = 0;
            rede = 0;
            el.textContent = formatar(0);
          }
        }
      },
      { threshold: [0, 0.25] },
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
