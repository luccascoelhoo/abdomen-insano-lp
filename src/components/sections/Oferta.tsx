import { CtaButton } from '@/components/ui/CtaButton';
import { Reveal } from '@/components/ui/Reveal';
import { microCta, oferta, selos } from '@/content/desafio';

export function Oferta() {
  return (
    <section className="sec sec--dark" id="oferta" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <Reveal className="oferta">
          {/* O 42 vazado atrás do preço, cortado pela borda de baixo. */}
          <div className="oferta__fantasma" aria-hidden="true">
            42
          </div>

          <div className="preco-bloco">
            {/* Headline curta e forte: R$1/dia. R$42 vira a confirmação
                matemática embaixo (1 real × 42 dias). */}
            <p className="preco-headline">
              <span>Por apenas</span>
              <b>
                R$1<i>/dia</i>
              </b>
            </p>
            <p className="preco-confirma">
              <small>{oferta.precoRotulo}</small>
              {oferta.precoNumero}
            </p>
          </div>

          <p className="oferta__pre" style={{ marginBottom: 18 }}>
            {oferta.fecho}
          </p>

          <p className="oferta__provoke">{oferta.provocacao}</p>
          <CtaButton origem="oferta" microcopy={microCta} />

          <div className="selos">
            {selos.map((selo) => (
              <div className="selo" key={selo.rotulo}>
                <b>{selo.rotulo}</b>
                {selo.valor}
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
