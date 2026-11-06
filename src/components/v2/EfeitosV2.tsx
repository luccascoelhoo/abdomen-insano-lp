'use client';

import { useEffect } from 'react';

/**
 * Os efeitos de entrada da página, num único observador.
 *
 * Cada bloco que está ABAIXO da primeira tela nasce levemente deslocado e
 * transparente e sobe para o lugar quando chega perto de quem rola — uma vez
 * só, sem refazer. A página antiga fazia isso com um componente por elemento;
 * aqui é um só `IntersectionObserver` marcando as classes, para não pesar na
 * abertura (a velocidade foi o motivo de a página nova ter perdido os efeitos).
 *
 * Só `opacity` e `transform` (não mexem no layout, não causam salto de tela) e
 * nada é escondido no servidor: o HTML chega inteiro e legível, e quem pediu
 * "reduzir movimento" no sistema, ou não tem o recurso, não recebe efeito.
 *
 * Não entra aqui o topo (já está na tela quando a página abre) nem a linha do
 * tempo do app (`.v2-timeline`, que é longa demais para subir como um bloco —
 * cada passo sobe sozinho).
 */
const ALVOS = '.v2 .v2-col > *:not(.v2-timeline), .v2 .v2-passo';

export function EfeitosV2() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!('IntersectionObserver' in window)) return;

    const io = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (!e.isIntersecting) continue;
          e.target.classList.add('v2-in');
          io.unobserve(e.target);
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.04 },
    );

    /*
     * Depois da primeira tela pintada (ocioso), e em duas passadas: primeiro
     * LÊ a posição de todos, depois ESCREVE as classes. Misturar leitura e
     * escrita a cada elemento força o navegador a refazer o layout 60 vezes —
     * foi o que custou ~0,25 s de travamento na primeira versão.
     */
    const marcar = () => {
      const limite = window.innerHeight * 0.95;
      const todos = Array.from(document.querySelectorAll<HTMLElement>(ALVOS));
      const abaixo = todos.filter((el) => el.getBoundingClientRect().top >= limite);
      abaixo.forEach((el) => {
        el.classList.add('v2-rv');
        io.observe(el);
      });
    };
    const ocioso = window.requestIdleCallback
      ? window.requestIdleCallback(marcar, { timeout: 1500 })
      : window.setTimeout(marcar, 600);

    return () => {
      io.disconnect();
      if (window.cancelIdleCallback) window.cancelIdleCallback(ocioso as number);
      else window.clearTimeout(ocioso as number);
    };
  }, []);

  return null;
}
