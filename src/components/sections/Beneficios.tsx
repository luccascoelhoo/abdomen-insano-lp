import { Reveal } from '@/components/ui/Reveal';
import { beneficios, beneficiosSecao } from '@/content/desafio';

export function Beneficios() {
  return (
    <section className="sec sec--alt">
      <div className="wrap">
        <Reveal as="p" className="eyebrow">
          {beneficiosSecao.eyebrow}
        </Reveal>
        <Reveal as="h2" className="h2">
          {beneficiosSecao.tituloLinhas[0]}
          <br />
          {beneficiosSecao.tituloLinhas[1]}
        </Reveal>
        <Reveal as="p" className="lead lead--top">
          {beneficiosSecao.lead}
        </Reveal>

        <Reveal className="benefits">
          {beneficios.map((b) => (
            <article className="benefit" key={b.titulo}>
              <h3>{b.titulo}</h3>
              <p>{b.texto}</p>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
