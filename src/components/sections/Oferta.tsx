import { Contador } from '@/components/ui/Contador';
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

          <p className="oferta__pre">{oferta.intro}</p>

          <div className="preco-bloco">
            <p className="preco-dia">{oferta.precoDia}</p>
            <p className="preco">
              <small>{oferta.precoRotulo}</small>
              <Contador ate={oferta.precoNumero} milhar={false} duracao={1200} />
            </p>
            <p className="preco-nota">{oferta.precoNota}</p>
          </div>

          <p className="oferta__pre" style={{ marginBottom: 34 }}>
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
