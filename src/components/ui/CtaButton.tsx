'use client';

import { useEffect, useRef, useState } from 'react';
import { oferta } from '@/content/desafio';
import { destinoPosCompra } from '@/lib/funil';
import { rastrear } from '@/lib/pixel';
import { anexarParametros, lerCookiesDoPixel, lerUtm } from '@/lib/utm';

type Props = {
  className?: string;
  children?: React.ReactNode;
  /** De onde partiu o clique — vira parâmetro do evento na Etapa 3. */
  origem?: string;
  /**
   * Texto pequeno que aparece embaixo do botão, tratando objeção antes
   * do clique (garantia, acesso, forma de pagamento).
   */
  microcopy?: string;
};

/**
 * O botão de compra.
 *
 * Dispara `InitiateCheckout` com `event_id` e leva ao checkout levando junto os
 * UTM e o `fbclid` guardados na chegada, mais a origem do clique. O `event_id`
 * é o que vai permitir deduplicar contra o `Purchase` server-side quando a
 * Conversions API entrar; antes dela ele já viaja, de propósito.
 */
export function CtaButton({
  className = 'cta',
  children,
  origem = 'oferta',
  microcopy,
}: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [href, setHref] = useState<string>(oferta.checkoutUrl);

  useEffect(() => {
    const utm = lerUtm();
    // Primeira parada depois do pagamento: upsell, se estiver pronto (lib/funil).
    const returnUrl = `${window.location.origin}${destinoPosCompra()}`;
    setHref(
      anexarParametros(oferta.checkoutUrl, {
        ...utm,
        ...lerCookiesDoPixel(),
        redirect_url: returnUrl,
        return_url: returnUrl,
        thank_you_url: returnUrl,
        origem,
      }),
    );
  }, [origem]);

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
  }, []);

  const link = (
    <a
      ref={ref}
      className={className}
      href={href}
      rel="noopener"
      data-origem={origem}
      onClick={() => {
        rastrear('InitiateCheckout', {
          value: oferta.precoNumero,
          currency: oferta.precoMoeda,
          content_name: 'Desafio Abdômen Insano',
          origem,
        });
      }}
    >
      {children ?? oferta.ctaTexto}
    </a>
  );

  if (!microcopy) return link;

  return (
    <span className="cta-wrap">
      {link}
      <span className="cta-microcopy">{microcopy}</span>
    </span>
  );
}
