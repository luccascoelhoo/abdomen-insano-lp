import { Reveal } from '@/components/ui/Reveal';
import { entregaveis, entregaveisSecao } from '@/content/desafio';

export function Entregaveis() {
  return (
    <section className="sec sec--dark">
      <div className="wrap deliver-wrap">
        <Reveal>
          <p className="eyebrow">{entregaveisSecao.eyebrow}</p>
          <h2 className="h2">{entregaveisSecao.titulo}</h2>
          <p className="lead lead--top">{entregaveisSecao.lead}</p>
        </Reveal>
        <Reveal delay={120}>
          <ul className="deliver-list">
            {entregaveis.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
