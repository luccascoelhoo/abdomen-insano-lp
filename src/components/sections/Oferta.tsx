import Image from 'next/image';
import { Countdown } from '@/components/ui/Countdown';
import { CtaButton } from '@/components/ui/CtaButton';
import { Reveal } from '@/components/ui/Reveal';
import { oferta, ofertaGarantias, ofertaItens } from '@/content/desafio';

/**
 * Ícones inline pras 3 garantias embaixo do card. Traço laranja, sem lib.
 */
const ICONE_GARANTIA = {
  compra: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 3l11 4v9c0 7-5 12-11 13-6-1-11-6-11-13V7z" />
      <path d="M11 16l4 4 6-8" />
    </svg>
  ),
  acesso: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="16" cy="16" r="12" />
      <path d="M16 8v8l5 3" />
    </svg>
  ),
  garantia: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 3l3 3 4-1 1 4 3 3-3 3 1 4-4 1-3 3-3-3-4 1-1-4-3-3 3-3-1-4 4-1z" />
      <path d="M12 16l3 3 6-7" />
    </svg>
  ),
} as const;

export function Oferta() {
  return (
    <section className="sec sec--dark" id="oferta" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <Reveal className="oferta-card">
          <header className="oferta-card__header">
            <div className="oferta-card__medalha" aria-hidden="true">
              <div className="oferta-card__halo" />
              <Image
                src="/img/logo-branca.svg"
                alt=""
                width={110}
                height={110}
              />
            </div>
            <div className="oferta-card__banner">
              <span className="oferta-card__banner-check" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12l4 4 10-10" />
                </svg>
              </span>
              <h2>{oferta.tituloAcesso}</h2>
            </div>
          </header>

          <ul className="oferta-card__lista">
            {ofertaItens.map((item, i) => (
              <Reveal as="li" key={item} delay={80 + i * 40}>
                {item}
              </Reveal>
            ))}
          </ul>

          <div className="oferta-card__preco">
            <span className="oferta-card__preco-pequeno">Por apenas</span>
            <p className="oferta-card__preco-grande">
              R$1<i>/dia</i>
            </p>
            <span className="oferta-card__preco-obs">
              R${oferta.precoNumero} · pagamento único
            </span>
          </div>

          <p className="oferta-card__provoke">{oferta.provocacao}</p>

          <CtaButton className="cta oferta-card__cta" origem="oferta" />

          <p className="oferta-card__tempo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
            <span>Oferta expira em</span>
            <Countdown className="oferta-card__timer" />
          </p>
        </Reveal>

        <div className="oferta-garantias">
          {ofertaGarantias.map((g, i) => (
            <Reveal className="oferta-garantia" key={g.titulo} delay={200 + i * 90}>
              <span className="oferta-garantia__icone" aria-hidden="true">
                {ICONE_GARANTIA[g.icone]}
              </span>
              <b>{g.titulo}</b>
              <small>{g.linha}</small>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
