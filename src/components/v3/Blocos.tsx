import { CtaButton } from '@/components/ui/CtaButton';
import { Rico } from '@/components/v2/Rico';
import { ctaV3, faixaV3, fechamentoV3, solucaoV3 } from '@/content/lp-v3';
import '@/app/v3/blocos.css';

/** A faixa laranja que corre entre o método e os casos. Decorativa. */
export function FaixaV3() {
  // Duas cópias seguidas: a animação anda metade da largura e recomeça sem emenda.
  const itens = [...faixaV3, ...faixaV3];
  return (
    <div className="v3-faixa" aria-hidden="true">
      <div className="v3-faixa__trilho">
        {itens.map((t, n) => (
          <span key={n}>{t}</span>
        ))}
      </div>
    </div>
  );
}

/** Nutricionista e educador físico à vista (os mesmos registros do rodapé). */
export function Responsaveis() {
  return (
    <p className="v3-responsaveis">
      <Rico texto={solucaoV3.responsaveis} />
    </p>
  );
}

/** O último empurrão: a provocação do Igor, o botão com o preço embaixo e o lema. */
export function FechamentoV3({ preco, origem }: { preco: string; origem: string }) {
  return (
    <section className="v2-sec v3-fechamento">
      <div className="v2-col v2-centro">
        <h2 className="v2-h2 v3-fechamento__titulo">{fechamentoV3.provocacao}</h2>
        <div data-v3="oferta">
          <CtaButton className="v2-cta" origem={origem} microcopy={preco}>
            {ctaV3}
          </CtaButton>
        </div>
        <p className="v2-oferta__lema">{fechamentoV3.lema}</p>
      </div>
    </section>
  );
}
