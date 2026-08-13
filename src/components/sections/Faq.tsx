import { Reveal } from '@/components/ui/Reveal';
import { faq, faqSecao } from '@/content/desafio';

export function Faq() {
  return (
    <section className="sec">
      <div className="wrap">
        <Reveal as="p" className="eyebrow">
          {faqSecao.eyebrow}
        </Reveal>
        <Reveal as="h2" className="h2">
          {faqSecao.titulo}
        </Reveal>

        {/* <details> nativo: abre sem JavaScript e já é acessível por teclado. */}
        <Reveal className="faq">
          {faq.map((item) => (
            <details key={item.pergunta}>
              <summary>{item.pergunta}</summary>
              <div className="answer">
                <p>{item.resposta}</p>
              </div>
            </details>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
