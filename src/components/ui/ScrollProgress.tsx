'use client';

import { useEffect, useRef } from 'react';

/**
 * Fio laranja no topo marcando o quanto da página já foi lida.
 *
 * Numa página longa de venda isso não é enfeite: é a promessa visível de que
 * tem fim. Escrito direto no estilo do elemento, sem estado do React, para não
 * disparar re-render a cada quadro de rolagem.
 */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const barra = ref.current;
    if (!barra) return;

    let pedido = 0;
    const medir = () => {
      pedido = 0;
      const alcance = document.documentElement.scrollHeight - window.innerHeight;
      const razao = alcance > 0 ? window.scrollY / alcance : 0;
      barra.style.transform = `scaleX(${Math.min(1, Math.max(0, razao))})`;
    };
    const aoRolar = () => {
      if (pedido) return;
      pedido = requestAnimationFrame(medir);
    };

    medir();
    window.addEventListener('scroll', aoRolar, { passive: true });
    window.addEventListener('resize', aoRolar);
    return () => {
      window.removeEventListener('scroll', aoRolar);
      window.removeEventListener('resize', aoRolar);
      if (pedido) cancelAnimationFrame(pedido);
    };
  }, []);

  return <div className="progresso" ref={ref} aria-hidden="true" />;
}
