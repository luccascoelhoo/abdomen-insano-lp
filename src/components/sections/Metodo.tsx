import { MaskTitle } from '@/components/ui/MaskTitle';
import { Reveal } from '@/components/ui/Reveal';
import { Semanas } from '@/components/ui/Semanas';
import { metodo, pilares } from '@/content/desafio';

export function Metodo() {
  return (
    <section className="sec sec--alt">
      <div className="wrap">
        <div className="metodo__grid">
          {/* Coluna esquerda gruda enquanto os pilares passam ao lado. */}
          <div className="metodo__fixo">
            <Reveal as="p" className="rotulo">
              {metodo.eyebrow}
            </Reveal>
            <MaskTitle className="d2" linhas={['Como funciona', 'essa parada?']} />
            <Reveal as="p" className="lead" delay={180}>
              {metodo.lead}
            </Reveal>
          </div>

          <div className="pilares">
            {pilares.map((pilar, i) => (
              <Reveal className="pilar" key={pilar.numero} delay={i * 80}>
                <span className="pilar__n" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="d3">{pilar.titulo}</h3>
                  {pilar.paragrafos.map((texto) => (
                    <p key={texto}>{texto}</p>
                  ))}
                  {pilar.aviso && (
                    <p className="pilar__nota">
                      <b>{pilar.aviso.rotulo}</b>
                      {pilar.aviso.texto}
                    </p>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Semanas />
      </div>
    </section>
  );
}
