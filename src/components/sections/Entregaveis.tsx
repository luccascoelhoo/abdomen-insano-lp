import { CtaButton } from '@/components/ui/CtaButton';
import { MaskTitle } from '@/components/ui/MaskTitle';
import { Reveal } from '@/components/ui/Reveal';
import { ctas, entregaveis, entregaveisSecao, microCta } from '@/content/desafio';

export function Entregaveis() {
  return (
    <section className="sec sec--dark">
      <div className="wrap entrega">
        <div>
          <Reveal as="p" className="rotulo rotulo--claro">
            {entregaveisSecao.eyebrow}
          </Reveal>
          <MaskTitle
            className="d2"
            linhas={['Depois dos', '42 dias,', 'ninguém vai', 'te reconhecer']}
          />
          <Reveal as="p" className="lead" delay={200}>
            {entregaveisSecao.lead}
          </Reveal>
        </div>

        <ul className="entrega__lista">
          {entregaveis.map((item, i) => (
            <Reveal as="li" key={item} delay={i * 90}>
              <i aria-hidden="true">{String(i + 1).padStart(2, '0')}</i>
              <span>{item}</span>
            </Reveal>
          ))}
        </ul>
      </div>

      <div className="wrap cta-fim">
        <Reveal delay={200}>
          <CtaButton origem="entregaveis" microcopy={microCta}>
            {ctas.entregaveis}
          </CtaButton>
        </Reveal>
      </div>
    </section>
  );
}
