import { Countdown } from '@/components/ui/Countdown';
import { CtaButton } from '@/components/ui/CtaButton';
import { Reveal } from '@/components/ui/Reveal';
import { oferta, ofertaGarantias } from '@/content/desafio';

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
    <section className="sec sec--dark" id="oferta">
      <div className="wrap">
        {/* Narrativa que abre a oferta — hierarquia visual referência do
            print da página modelo. Alinhamento à esquerda, com destaques
            laranja pontuais e a "promessa" em fonte gigante. */}
        <div className="oferta-narrativa">
          <Reveal as="p" className="oferta-narrativa__pergunta">
            <span className="oferta-narrativa__hl">{oferta.perguntaAntes}</span>
            {oferta.perguntaMeio}
            <span className="oferta-narrativa__hl">{oferta.perguntaDepois}</span>
          </Reveal>

          <Reveal as="p" className="oferta-narrativa__promessa" delay={120}>
            {oferta.promessaAntes}
            <span className="oferta-narrativa__hl">{oferta.promessaDestaque}</span>
          </Reveal>

          <Reveal as="p" className="oferta-narrativa__destaque" delay={200}>
            {oferta.destaque}
          </Reveal>

          <Reveal as="p" className="oferta-narrativa__paragrafo" delay={260}>
            {oferta.reforco}
          </Reveal>
          <Reveal as="p" className="oferta-narrativa__paragrafo" delay={320}>
            {oferta.fecho}
          </Reveal>
          <Reveal as="p" className="oferta-narrativa__paragrafo" delay={380}>
            {oferta.fechoDestaque}
          </Reveal>
        </div>

        <Reveal className="oferta-card oferta-card--enxuto">
          <div className="oferta-card__preco">
            <span className="oferta-card__preco-pequeno">Por apenas</span>
            <p className="oferta-card__preco-grande">
              R${oferta.precoNumero}<i>,00</i>
            </p>
            <span className="oferta-card__preco-obs">
              equivale a R$1 por dia · pagamento único
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
