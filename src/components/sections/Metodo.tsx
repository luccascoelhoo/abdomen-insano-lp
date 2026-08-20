import Image from 'next/image';
import { MaskTitle } from '@/components/ui/MaskTitle';
import { Reveal } from '@/components/ui/Reveal';
import { Semanas } from '@/components/ui/Semanas';
import { metodo, pilares } from '@/content/desafio';

export function Metodo() {
  return (
    <section className="sec metodo-dark">
      <div className="wrap">
        <div className="metodo-dark__cab">
          <MaskTitle className="d2" linhas={['Como funciona', 'essa parada?']} />
          <Reveal as="p" className="lead lead--claro" delay={180}>
            {metodo.lead}
          </Reveal>
        </div>

        <div className="metodo-dark__mosaico">
          {pilares.map((pilar, i) => (
            <Reveal
              key={pilar.numero}
              className={`card-metodo card-metodo--${pilar.numero}`}
              delay={i * 80}
            >
              <div className="card-metodo__foto">
                {pilar.foto ? (
                  <Image
                    src={pilar.foto.src}
                    alt={pilar.foto.alt}
                    fill
                    sizes="(min-width: 900px) 45vw, 100vw"
                  />
                ) : null}
              </div>

              <div className="card-metodo__corpo">
                <h3 className="card-metodo__titulo">
                  {pilar.numero} - {pilar.titulo}
                </h3>
                {pilar.paragrafos.map((texto) => (
                  <p key={texto}>{texto}</p>
                ))}
                {pilar.aviso && (
                  <p className="card-metodo__aviso">
                    <b>{pilar.aviso.rotulo}:</b> {pilar.aviso.texto}
                  </p>
                )}
                {i === 0 && <Semanas />}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
