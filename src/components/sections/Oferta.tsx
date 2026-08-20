import { ContadorReverso } from '@/components/ui/ContadorReverso';
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
            {/* "De R$497" riscado — visualmente ancora o preço final. Não é
                animado: fica ali estático enquanto o número desce ao lado. */}
            <p className="preco-de" aria-hidden="true">
              <span>{oferta.precoDeRotulo.split(' ')[0]}</span>
              <s>R$ {oferta.precoDe}</s>
              <span>{oferta.precoDeRotulo.split(' ').slice(2).join(' ')}</span>
            </p>
            <p className="preco">
              <small>{oferta.precoRotulo}</small>
              <ContadorReverso
                de={oferta.precoDe}
                ate={oferta.precoNumero}
                marcos={[...oferta.precoMarcos]}
                duracao={2400}
              />
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
