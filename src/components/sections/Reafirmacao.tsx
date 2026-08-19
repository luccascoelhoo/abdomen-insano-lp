import { CtaButton } from '@/components/ui/CtaButton';
import { MaskTitle } from '@/components/ui/MaskTitle';
import { Reveal } from '@/components/ui/Reveal';
import { ctas, microCta, reafirmacao } from '@/content/desafio';

/**
 * Bloco de reafirmação — o "fechamento" do modelo Mateus Dias, logo depois
 * do FAQ. Recapitula tudo que a pessoa recebe, o preço e a garantia, e devolve
 * o CTA. Quem chegou até aqui já quer clicar — este bloco só empurra.
 */
export function Reafirmacao() {
  return (
    <section className="sec sec--dark reafirmacao">
      <div className="wrap">
        <Reveal as="p" className="rotulo rotulo--claro">
          {reafirmacao.eyebrow}
        </Reveal>
        <MaskTitle
          as="h2"
          className="d2 reafirmacao__titulo"
          linhas={reafirmacao.tituloLinhas}
          classesLinha={['linha', 'linha--2']}
        />

        <ul className="reafirmacao__lista">
          {reafirmacao.itens.map((item, i) => (
            <Reveal
              as="li"
              key={item}
              className="reafirmacao__item"
              delay={160 + i * 90}
            >
              <span className="reafirmacao__marca" aria-hidden="true">
                ✓
              </span>
              {item}
            </Reveal>
          ))}
        </ul>

        <Reveal as="p" className="reafirmacao__fecho" delay={780}>
          {reafirmacao.fecho}
        </Reveal>

        <div className="cta-fim">
          <Reveal delay={880}>
            <CtaButton origem="reafirmacao" microcopy={microCta}>
              {ctas.oferta}
            </CtaButton>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
