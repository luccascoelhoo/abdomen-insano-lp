'use client';

import { useEffect, type RefObject } from 'react';

/**
 * O "botão magnético": no computador o botão é puxado de leve na direção do
 * cursor e volta ao sair. Fica num hook para valer em todo botão de compra da
 * página — o de rolagem (`BotaoRolagem`) tinha perdido o efeito quando deixou
 * de usar o `CtaButton`.
 *
 * Só no computador: toque não tem hover útil, e quem pediu "reduzir movimento"
 * no sistema não recebe o efeito.
 */
export function useMagnetico(ref: RefObject<HTMLAnchorElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Toque não tem hover útil — desliga o magnético em dispositivos táteis.
    if (window.matchMedia('(hover: none)').matches) return;

    // Puxão máximo em pixels: pequeno o bastante pra parecer atrito, não uma
    // corrida atrás do cursor.
    const FORCA = 8;
    let quadro = 0;
    let alvoX = 0;
    let alvoY = 0;
    let atualX = 0;
    let atualY = 0;

    const passo = () => {
      atualX += (alvoX - atualX) * 0.18;
      atualY += (alvoY - atualY) * 0.18;
      el.style.transform = `translate3d(${atualX.toFixed(2)}px, ${atualY.toFixed(2)}px, 0)`;
      if (Math.abs(alvoX - atualX) > 0.05 || Math.abs(alvoY - atualY) > 0.05) {
        quadro = requestAnimationFrame(passo);
      } else {
        quadro = 0;
      }
    };

    const aoMover = (evento: PointerEvent) => {
      const cx = el.getBoundingClientRect();
      const dx = evento.clientX - (cx.left + cx.width / 2);
      const dy = evento.clientY - (cx.top + cx.height / 2);
      // Normaliza pelo raio do botão e limita a intensidade máxima.
      alvoX = Math.max(-FORCA, Math.min(FORCA, (dx / cx.width) * FORCA * 2));
      alvoY = Math.max(-FORCA, Math.min(FORCA, (dy / cx.height) * FORCA * 2));
      if (!quadro) quadro = requestAnimationFrame(passo);
    };
    const aoSair = () => {
      alvoX = 0;
      alvoY = 0;
      if (!quadro) quadro = requestAnimationFrame(passo);
    };

    el.addEventListener('pointermove', aoMover);
    el.addEventListener('pointerleave', aoSair);
    return () => {
      el.removeEventListener('pointermove', aoMover);
      el.removeEventListener('pointerleave', aoSair);
      if (quadro) cancelAnimationFrame(quadro);
      el.style.transform = '';
    };
  }, [ref]);
}
