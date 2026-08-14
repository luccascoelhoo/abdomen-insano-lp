import { MaskTitle } from '@/components/ui/MaskTitle';
import { Reveal } from '@/components/ui/Reveal';
import { entregaveis, entregaveisSecao } from '@/content/desafio';

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

        <Reveal delay={140}>
          <ul className="entrega__lista">
            {entregaveis.map((item, i) => (
              <li key={item}>
                <i aria-hidden="true">{String(i + 1).padStart(2, '0')}</i>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
