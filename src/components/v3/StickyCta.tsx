'use client';

import { useEffect, useState } from 'react';
import { CtaButton } from '@/components/ui/CtaButton';
import { reais, type Parcelamento } from '@/lib/parcelamento';

/**
 * Barra de compra presa no rodapé do celular. Aparece depois que o botão do
 * topo sai da tela e se esconde enquanto o card da oferta está visível, pra
 * nunca haver dois botões de compra na mesma tela.
 *
 * Os alvos são achados por `data-v3`: `topo` (botão do hero) e `oferta`
 * (card de compra). O botão é o `CtaButton` de sempre, com origem própria.
 */
export function StickyCta({ parcelamento, texto }: { parcelamento: Parcelamento; texto: string }) {
  const [topoVisivel, setTopoVisivel] = useState(true);
  const [ofertaVisivel, setOfertaVisivel] = useState(false);

  useEffect(() => {
    const topo = document.querySelector('[data-v3="topo"]');
    const oferta = document.querySelector('[data-v3="oferta"]');
    const observadores: IntersectionObserver[] = [];
    if (topo) {
      const o = new IntersectionObserver(([e]) => setTopoVisivel(e.isIntersecting));
      o.observe(topo);
      observadores.push(o);
    }
    if (oferta) {
      // Fecha no primeiro pixel do card: o lado seguro, nunca dois botões na tela.
      const o = new IntersectionObserver(([e]) => setOfertaVisivel(e.isIntersecting));
      o.observe(oferta);
      observadores.push(o);
    }
    return () => observadores.forEach((o) => o.disconnect());
  }, []);

  const aberta = !topoVisivel && !ofertaVisivel;

  return (
    <div className={`v3-sticky${aberta ? ' is-aberta' : ''}`} aria-hidden={!aberta} inert={!aberta}>
      <p className="v3-sticky__preco">
        <b>{parcelamento.vezes}x R$ {reais(parcelamento.parcelaCentavos)}</b>
        <span>ou R$ {reais(parcelamento.avistaCentavos)} à vista</span>
      </p>
      <CtaButton className="v2-cta v3-sticky__cta" origem="v3-sticky">
        {texto}
      </CtaButton>
    </div>
  );
}
