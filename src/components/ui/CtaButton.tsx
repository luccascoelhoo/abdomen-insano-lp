'use client';

import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react';
import { oferta } from '@/content/desafio';
import { destinoPosCompra } from '@/lib/funil';
import { jaEstaSaindo, rastrear, seguirAposMedir } from '@/lib/pixel';
import { ID_FRONT } from '@/lib/produtos';
import { useMagnetico } from '@/components/ui/useMagnetico';
import { usePreco } from '@/components/ui/Precos';
import { sckDaCompra } from '@/lib/pagina-de-origem';
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
  const preco = usePreco(ID_FRONT);

  // O link é montado de novo no clique: no carregamento o pixel ainda não criou
  // o cookie `_fbp`, e o checkout saía sem ele (auditoria de 28/09/2026).
  const montarLink = useCallback(() => {
    const utm = lerUtm();
    // Primeira parada depois do pagamento: upsell, se estiver pronto (lib/funil).
    const returnUrl = `${window.location.origin}${destinoPosCompra()}`;
    return anexarParametros(oferta.checkoutUrl, {
      ...utm,
      ...lerCookiesDoPixel(),
      redirect_url: returnUrl,
      return_url: returnUrl,
      thank_you_url: returnUrl,
      origem,
      // A Cakto devolve o `sck` no aviso de venda (e não devolve `origem`):
      // é por ele que a venda volta sabendo de qual página partiu.
      sck: sckDaCompra(window.location.pathname, origem),
    });
  }, [origem]);

  useEffect(() => {
    setHref(montarLink());
  }, [montarLink]);

  function aoClicar(evento: MouseEvent<HTMLAnchorElement>) {
    if (jaEstaSaindo(evento)) return;
    // Primeiro o link, que é o que a venda precisa; depois a medição.
    evento.currentTarget.href = montarLink();
    rastrear(
      'InitiateCheckout',
      {
        value: preco ?? oferta.precoNumero,
        currency: oferta.precoMoeda,
        content_ids: [ID_FRONT],
        content_name: 'Desafio Abdômen Insano',
        content_type: 'product',
        origem,
      },
      ID_FRONT,
    );
    seguirAposMedir(evento);
  }

  useMagnetico(ref);

  const link = (
    <a
      ref={ref}
      className={className}
      href={href}
      rel="noopener"
      data-origem={origem}
      onClick={aoClicar}
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
