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
 * (card de compra e fechamento, qualquer bloco com botão próprio). O botão é o `CtaButton` de sempre, com origem própria.
 */
export function StickyCta({ parcelamento, texto }: { parcelamento: Parcelamento; texto: string }) {
  const [topoVisivel, setTopoVisivel] = useState(true);
  const [ofertaVisivel, setOfertaVisivel] = useState(false);

  useEffect(() => {
    const topo = document.querySelector('[data-v3="topo"]');
    const ofertas = document.querySelectorAll('[data-v3="oferta"]');
    const observadores: IntersectionObserver[] = [];
    if (topo) {
      const o = new IntersectionObserver(([e]) => setTopoVisivel(e.isIntersecting));
      o.observe(topo);
      observadores.push(o);
    }
    if (ofertas.length) {
      // Fecha no primeiro pixel de qualquer bloco com botão: nunca dois botões na tela.
      const visiveis = new Set<Element>();
      const o = new IntersectionObserver((entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting) visiveis.add(e.target);
          else visiveis.delete(e.target);
        }
        setOfertaVisivel(visiveis.size > 0);
      });
      ofertas.forEach((el) => o.observe(el));
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
