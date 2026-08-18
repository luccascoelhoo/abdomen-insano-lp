import { CtaButton } from '@/components/ui/CtaButton';
import { MaskTitle } from '@/components/ui/MaskTitle';
import { Reveal } from '@/components/ui/Reveal';
import { bonus, bonusSecao, ctas, microCta } from '@/content/desafio';

export function Bonus() {
  return (
    <section className="sec sec--dark" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <Reveal as="p" className="rotulo rotulo--claro">
          {bonusSecao.eyebrow}
        </Reveal>
        <MaskTitle className="d2" linhas={bonusSecao.tituloLinhas} />

        <div className="bonus-grid">
          {bonus.map((b, i) => (
            <Reveal
              className={b.largo ? 'bonus bonus--wide' : 'bonus'}
              key={b.titulo}
              delay={i * 70}
            >
              <span className="tag">Bônus {String(i + 1).padStart(2, '0')}</span>
              <h3 className="d3">{b.titulo}</h3>
              <p>{b.texto}</p>
            </Reveal>
          ))}
        </div>

        <div className="cta-fim">
          <Reveal delay={140}>
            <CtaButton origem="bonus" microcopy={microCta}>
              {ctas.bonus}
            </CtaButton>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
