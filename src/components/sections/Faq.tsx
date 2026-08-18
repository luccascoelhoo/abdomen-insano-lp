import { CtaButton } from '@/components/ui/CtaButton';
import { FaqItem } from '@/components/ui/FaqItem';
import { MaskTitle } from '@/components/ui/MaskTitle';
import { Reveal } from '@/components/ui/Reveal';
import { ctas, faq, faqSecao, microCta } from '@/content/desafio';

export function Faq() {
  return (
    <section className="sec">
      <div className="wrap">
        <Reveal as="p" className="rotulo">
          {faqSecao.eyebrow}
        </Reveal>
        <MaskTitle className="d2" linhas={['Perguntas', 'frequentes']} />

        <Reveal className="faq">
          {faq.map((item, i) => (
            <FaqItem
              key={item.pergunta}
              numero={String(i + 1).padStart(2, '0')}
              pergunta={item.pergunta}
              resposta={item.resposta}
            />
          ))}
        </Reveal>

        <div className="cta-fim">
          <Reveal delay={140}>
            <CtaButton origem="faq" microcopy={microCta}>
              {ctas.faq}
            </CtaButton>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
