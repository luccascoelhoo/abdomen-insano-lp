'use client';

import { useEffect, useRef, useState } from 'react';
import { CtaButton } from '@/components/ui/CtaButton';
import { ctas, oferta } from '@/content/desafio';

/**
 * Barra fixa de compra no celular.
 *
 * O furo do desenho antigo: o único botão da página vive a ~90% da rolagem,
 * mas o leitor decide na hora dos depoimentos e não tem onde clicar.
 *
 * Regras: só aparece depois do primeiro terço da página e some quando o bloco
 * de oferta entra na tela — para nunca competir com o botão principal. Mostra
 * também a porcentagem lida no topo, virando compromisso progressivo:
 * "chegou até aqui, faltam X% pra fechar".
 */
export function StickyCta() {
  const [visivel, setVisivel] = useState(false);
  const [pct, setPct] = useState(0);
  const barraRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const blocoOferta = document.getElementById('oferta');
    let ofertaNaTela = false;

    const avaliar = () => {
      const alturaRolagem = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      const progresso = Math.max(0, Math.min(1, window.scrollY / alturaRolagem));
      const rolou = window.scrollY > window.innerHeight * 0.9;

      // Escreve direto na variável CSS pra evitar re-render por frame; o React
      // controla só a visibilidade e o rótulo textual.
      if (barraRef.current) {
        barraRef.current.style.setProperty('--progresso', progresso.toFixed(4));
      }
      const pctInt = Math.round(progresso * 100);
      setPct((atual) => (atual === pctInt ? atual : pctInt));
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
    <div
      ref={barraRef}
      className={visivel ? 'sticky-cta sticky-cta--on' : 'sticky-cta'}
      aria-hidden={!visivel}
    >
      <div className="sticky-cta__lido" aria-hidden="true">
        {pct}% lido
      </div>
      <div className="sticky-cta__preco">
        <b>
          {oferta.precoRotulo}
          {oferta.precoNumero}
        </b>
        <span>1 real por dia</span>
      </div>
      <CtaButton className="cta sticky-cta__botao" origem="sticky">
        {ctas.sticky}
      </CtaButton>
    </div>
  );
}
