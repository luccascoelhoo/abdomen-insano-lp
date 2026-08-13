'use client';

import { oferta } from '@/content/desafio';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

type Props = {
  className?: string;
  children?: React.ReactNode;
  /** De onde partiu o clique — vira parâmetro do evento na Etapa 3. */
  origem?: string;
};

/**
 * O botão de compra.
 *
 * Hoje dispara `InitiateCheckout` e leva ao checkout. Na Etapa 3 este é o
 * ponto onde entram os UTM/`fbclid` guardados na chegada (hoje eles morrem no
 * clique, e é por isso que não dá pra atribuir venda a criativo) e o
 * `event_id` compartilhado com a Conversions API.
 */
export function CtaButton({ className = 'cta', children, origem = 'oferta' }: Props) {
  return (
    <a
      className={className}
      href={oferta.checkoutUrl}
      rel="noopener"
      data-origem={origem}
      onClick={() => {
        window.fbq?.('track', 'InitiateCheckout', {
          value: oferta.precoNumero,
          currency: oferta.precoMoeda,
        });
      }}
    >
      {children ?? oferta.ctaTexto}
    </a>
  );
}
