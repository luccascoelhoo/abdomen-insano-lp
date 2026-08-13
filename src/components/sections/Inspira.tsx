import { Reveal } from '@/components/ui/Reveal';
import { inspira } from '@/content/desafio';

export function Inspira() {
  return (
    <section className="sec sec--dark">
      <div className="wrap inspire-wrap">
        <Reveal as="p" className="inspire-quote">
          {inspira.citacaoAntes}
          <em>{inspira.citacaoDestaque}</em>
        </Reveal>
        <Reveal className="inspire-body" delay={120}>
          <p>{inspira.corpo}</p>
        </Reveal>
      </div>
    </section>
  );
}
