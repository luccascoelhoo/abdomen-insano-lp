import { Reveal } from '@/components/ui/Reveal';
import { metodo, pilares, semanas } from '@/content/desafio';

/** A intensidade da semana cresce com a barra — mesma escala do desenho original. */
const OPACIDADE_SEMANA = [0.35, 0.48, 0.6, 0.72, 0.86, 1];

export function Metodo() {
  return (
    <section className="sec sec--alt">
      <div className="wrap">
        <Reveal as="p" className="eyebrow">
          {metodo.eyebrow}
        </Reveal>
        <Reveal as="h2" className="h2">
          {metodo.titulo}
        </Reveal>
        <Reveal as="p" className="lead lead--top">
          {metodo.lead}
        </Reveal>

        <Reveal className="pillars">
          {pilares.map((pilar) => (
            <article className="pillar" key={pilar.numero}>
              <span className="n">{pilar.numero}</span>
              <h3>{pilar.titulo}</h3>
              {pilar.paragrafos.map((texto) => (
                <p key={texto}>{texto}</p>
              ))}
              {pilar.aviso && (
                <p className="warn">
                  <b>{pilar.aviso.rotulo}</b>
                  {pilar.aviso.texto}
                </p>
              )}
            </article>
          ))}
        </Reveal>

        <Reveal className="weeks">
          {semanas.map((semana, i) => (
            <div
              className={i === semanas.length - 1 ? 'week week--6' : 'week'}
              key={semana.rotulo}
            >
              <span className="lbl">{semana.rotulo}</span>
              <h4>{semana.titulo}</h4>
              <div
                className="days"
                aria-hidden="true"
                style={{ ['--week-op' as string]: OPACIDADE_SEMANA[i] }}
              >
                {Array.from({ length: 7 }, (_, d) => (
                  <i key={d} style={{ transitionDelay: `${i * 90 + d * 40}ms` }} />
                ))}
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
