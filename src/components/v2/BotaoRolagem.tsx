'use client';

import { useRef, type MouseEvent, type ReactNode } from 'react';
import { useMagnetico } from '@/components/ui/useMagnetico';

/**
 * Botão que rola a página até uma seção (em vez de abrir o checkout).
 *
 * Os botões de antes do preço levam ao "como funciona" do app (pedido do Igor
 * em 06/11/2026): quem vê o aplicativo antes de ver o preço chega à oferta
 * sabendo o que está comprando. Os de depois do preço continuam no checkout
 * (`CtaButton`). Mesmo visual, mesma `.v2-cta` — só o destino muda.
 */
export function BotaoRolagem({ alvo, children }: { alvo: string; children: ReactNode }) {
  const ref = useRef<HTMLAnchorElement>(null);
  useMagnetico(ref);

  function rolar(evento: MouseEvent<HTMLAnchorElement>) {
    const secao = document.getElementById(alvo);
    if (!secao) return;
    evento.preventDefault();
    const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    secao.scrollIntoView({ behavior: reduzir ? 'auto' : 'smooth', block: 'start' });
    // Mantém o endereço compartilhável sem pular a página de novo.
    history.replaceState(null, '', `#${alvo}`);
  }

  return (
    <a ref={ref} className="v2-cta" href={`#${alvo}`} onClick={rolar}>
      {children}
    </a>
  );
}
