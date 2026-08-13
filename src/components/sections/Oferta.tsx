import { CtaButton } from '@/components/ui/CtaButton';
import { Reveal } from '@/components/ui/Reveal';
import { oferta, selos } from '@/content/desafio';

export function Oferta() {
  return (
    <section className="sec sec--dark" id="oferta" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <Reveal className="offer">
          <p className="pre">{oferta.intro}</p>

          <div className="price-block">
            <p className="price-day">{oferta.precoDia}</p>
            <p className="price">
              <small>{oferta.precoRotulo}</small>
              {oferta.precoNumero}
            </p>
            <p className="price-note">{oferta.precoNota}</p>
          </div>

          <p className="pre pre--fecho">{oferta.fecho}</p>

          <p className="offer-provoke">{oferta.provocacao}</p>
          <CtaButton origem="oferta" />

          <div className="seals">
            {selos.map((selo) => (
              <div className="seal" key={selo.rotulo}>
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
