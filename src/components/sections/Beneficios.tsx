import { MaskTitle } from '@/components/ui/MaskTitle';
import { Reveal } from '@/components/ui/Reveal';
import { beneficios, beneficiosSecao } from '@/content/desafio';

export function Beneficios() {
  return (
    <section className="sec sec--alt">
      <div className="wrap">
        <MaskTitle className="d2" linhas={beneficiosSecao.tituloLinhas} />
        <Reveal as="p" className="lead" delay={180}>
          {beneficiosSecao.lead}
        </Reveal>

        <div className="beneficios">
          {beneficios.map((b, i) => (
            <Reveal className="beneficio" key={b.titulo} delay={(i % 2) * 90}>
              <span className="beneficio__n">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="d3">{b.titulo}</h3>
              <p>{b.texto}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
