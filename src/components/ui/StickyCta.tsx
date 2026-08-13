'use client';

import { useEffect, useState } from 'react';
import { CtaButton } from '@/components/ui/CtaButton';
import { oferta } from '@/content/desafio';

/**
 * Barra fixa de compra no celular.
 *
 * O furo do desenho antigo: o único botão da página vive a ~90% da rolagem,
 * mas o leitor decide na hora dos depoimentos e não tem onde clicar.
 *
 * Regras: só aparece depois do primeiro terço da página e some quando o bloco
 * de oferta entra na tela — para nunca competir com o botão principal.
 */
export function StickyCta() {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const blocoOferta = document.getElementById('oferta');
    let ofertaNaTela = false;

    const avaliar = () => {
      const rolou = window.scrollY > window.innerHeight * 0.9;
      setVisivel(rolou && !ofertaNaTela);
    };

    const io = blocoOferta
      ? new IntersectionObserver(
          ([entry]) => {
            ofertaNaTela = entry.isIntersecting;
            avaliar();
          },
          { threshold: 0 },
        )
      : null;
    if (blocoOferta) io?.observe(blocoOferta);

    window.addEventListener('scroll', avaliar, { passive: true });
    avaliar();

    return () => {
      window.removeEventListener('scroll', avaliar);
      io?.disconnect();
    };
  }, []);

  return (
    <div className={visivel ? 'sticky-cta sticky-cta--on' : 'sticky-cta'} aria-hidden={!visivel}>
      <div className="sticky-cta__preco">
        <b>
          {oferta.precoRotulo}
          {oferta.precoNumero}
        </b>
        <span>1 real por dia</span>
      </div>
      <CtaButton className="cta sticky-cta__botao" origem="sticky" />
    </div>
  );
}
