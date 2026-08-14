import { MaskTitle } from '@/components/ui/MaskTitle';
import { Reveal } from '@/components/ui/Reveal';
import { faq, faqSecao } from '@/content/desafio';

export function Faq() {
  return (
    <section className="sec">
      <div className="wrap">
        <Reveal as="p" className="rotulo">
          {faqSecao.eyebrow}
        </Reveal>
        <MaskTitle className="d2" linhas={['Perguntas', 'frequentes']} />

        {/* <details> nativo: abre sem JavaScript e já é acessível por teclado. */}
        <Reveal className="faq">
          {faq.map((item, i) => (
            <details key={item.pergunta}>
              <summary>
                <i aria-hidden="true">{String(i + 1).padStart(2, '0')}</i>
                <span>{item.pergunta}</span>
                <u aria-hidden="true">+</u>
              </summary>
              <div className="resposta">
                <p>{item.resposta}</p>
              </div>
            </details>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
