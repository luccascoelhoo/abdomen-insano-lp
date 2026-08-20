import { FaqItem } from '@/components/ui/FaqItem';
import { MaskTitle } from '@/components/ui/MaskTitle';
import { Reveal } from '@/components/ui/Reveal';
import { faq } from '@/content/desafio';

export function Faq() {
  return (
    <section className="sec">
      <div className="wrap">
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
      </div>
    </section>
  );
}
