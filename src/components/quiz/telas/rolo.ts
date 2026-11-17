'use client';

import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

/**
 * Rolagem nativa com encaixe (CSS scroll-snap) para os controles do app na web:
 * a régua (horizontal) e as colunas da roda de datas (vertical).
 *
 * O dedo, o trackpad e a inércia são do navegador. Este gancho só:
 *  - lê o item no centro (`posição / passo`) e avisa quando ele muda;
 *  - leva o rolo até o item controlado quando o valor muda de fora;
 *  - no computador, arrasta com o mouse e dá um passo por "clique" da roda.
 */

export const reduzMovimento = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** O `selectionChanged()` do app: uma batidinha por traço, onde o aparelho deixa. */
function tique() {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') navigator.vibrate(5);
  } catch {
    // Sem vibração (desktop, iOS, permissão): segue sem.
  }
}

const limitar = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

interface OpcoesRolo {
  eixo: 'x' | 'y';
  /** Pixels por item (o mesmo espaçamento do CSS). */
  passo: number;
  /** Item selecionado (controlado por quem usa). */
  indice: number;
  total: number;
  aoMudar: (i: number) => void;
  vibrar?: boolean;
}

export function useRolo({ eixo, passo, indice, total, aoMudar, vibrar = false }: OpcoesRolo) {
  const ref = useRef<HTMLDivElement>(null);
  /** Último item que o rolo mostrou (ou que já foi avisado). */
  const ultimo = useRef(-1);
  const arrastou = useRef(false);
  const aoMudarVivo = useRef(aoMudar);
  useLayoutEffect(() => {
    aoMudarVivo.current = aoMudar;
  });

  const lerIndice = useCallback(
    (el: HTMLElement) => limitar(Math.round((eixo === 'x' ? el.scrollLeft : el.scrollTop) / passo), 0, total - 1),
    [eixo, passo, total],
  );

  const irPara = useCallback(
    (i: number, suave = false) => {
      const el = ref.current;
      if (!el) return;
      const alvo = limitar(Math.round(i), 0, total - 1) * passo;
      const behavior: ScrollBehavior = suave && !reduzMovimento() ? 'smooth' : 'auto';
      el.scrollTo(eixo === 'x' ? { left: alvo, behavior } : { top: alvo, behavior });
    },
    [eixo, passo, total],
  );

  /** Item no centro agora (lido do rolo, não do estado: vale no meio de um giro). */
  const atual = useCallback(() => (ref.current ? lerIndice(ref.current) : indice), [lerIndice, indice]);

  // Valor mudou de fora (montagem, dia cortado pelo mês, data devolvida à faixa).
  // O que veio do próprio rolo já está em `ultimo` e não mexe na rolagem, para
  // não matar a inércia no meio.
  useLayoutEffect(() => {
    if (indice === ultimo.current) return;
    ultimo.current = indice;
    irPara(indice);
  }, [indice, irPara]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const xy = (e: PointerEvent) => (eixo === 'x' ? e.clientX : e.clientY);

    const aoRolar = () => {
      const i = lerIndice(el);
      if (i === ultimo.current) return;
      ultimo.current = i;
      if (vibrar) tique();
      aoMudarVivo.current(i);
    };

    // Roda do mouse: um item por "clique". Na régua (horizontal) o giro
    // vertical também anda; o trackpad na direção do rolo fica nativo.
    let acumulado = 0;
    const aoGirar = (e: WheelEvent) => {
      if (e.ctrlKey) return;
      const notch = e.deltaMode !== 0 || Math.abs(e.deltaY) >= 50;
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      if (eixo === 'y' && !notch) return;
      const d = e.deltaY;
      const i = lerIndice(el);
      // Na ponta, a página rola normalmente.
      if ((d < 0 && i <= 0) || (d > 0 && i >= total - 1)) return;
      e.preventDefault();
      let passos: number;
      if (notch) {
        passos = Math.sign(d);
        acumulado = 0;
      } else {
        acumulado += d;
        passos = Math.trunc(acumulado / passo);
        acumulado -= passos * passo;
      }
      if (passos) irPara(i + passos);
    };

    // Arrastar com o mouse (o toque já rola sozinho).
    let arrasto: { id: number; inicio: number; pos: number } | null = null;
    const desce = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      arrasto = { id: e.pointerId, inicio: xy(e), pos: eixo === 'x' ? el.scrollLeft : el.scrollTop };
      arrastou.current = false;
    };
    const move = (e: PointerEvent) => {
      if (!arrasto || e.pointerId !== arrasto.id) return;
      const d = xy(e) - arrasto.inicio;
      if (!arrastou.current) {
        if (Math.abs(d) < 4) return;
        arrastou.current = true;
        el.setPointerCapture(e.pointerId);
        el.style.scrollSnapType = 'none';
        el.classList.add('qc-arrastando');
      }
      e.preventDefault();
      if (eixo === 'x') el.scrollLeft = arrasto.pos - d;
      else el.scrollTop = arrasto.pos - d;
    };
    const sobe = (e: PointerEvent) => {
      if (!arrasto || e.pointerId !== arrasto.id) return;
      arrasto = null;
      if (!arrastou.current) return;
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {
        // Já solto.
      }
      el.style.scrollSnapType = '';
      el.classList.remove('qc-arrastando');
      irPara(lerIndice(el), true);
    };

    el.addEventListener('scroll', aoRolar, { passive: true });
    el.addEventListener('wheel', aoGirar, { passive: false });
    el.addEventListener('pointerdown', desce);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', sobe);
    el.addEventListener('pointercancel', sobe);
    return () => {
      el.removeEventListener('scroll', aoRolar);
      el.removeEventListener('wheel', aoGirar);
      el.removeEventListener('pointerdown', desce);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', sobe);
      el.removeEventListener('pointercancel', sobe);
    };
  }, [eixo, passo, total, lerIndice, irPara, vibrar]);

  /** O clique que fecha um arrasto não é toque num item. */
  const foiArrasto = useCallback(() => arrastou.current, []);

  return { ref, irPara, atual, foiArrasto };
}
