import Image from 'next/image';
import { MaskTitle } from '@/components/ui/MaskTitle';
import { Reveal } from '@/components/ui/Reveal';
import { expert } from '@/content/desafio';

export function Expert() {
  return (
    <section className="sec sec--alt">
      <div className="wrap">
        <MaskTitle className="d2" linhas={expert.tituloLinhas} />

        <div className="antes-depois">
          <Reveal className="coluna coluna--antes">
            <h3>{expert.antesTitulo}</h3>
            <div className="coluna__foto">
              <Image
                src={expert.fotoAntes}
                alt="Igor Correa antes do desafio"
                width={1080}
                height={1920}
                sizes="(min-width: 760px) 40vw, 90vw"
              />
            </div>
            <ul>
              {expert.antes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Reveal>
          <Reveal className="coluna coluna--hoje" delay={120}>
            <h3>{expert.hojeTitulo}</h3>
            <div className="coluna__foto">
              <Image
                src={expert.fotoHoje}
                alt="Igor Correa hoje"
                width={1080}
                height={1920}
                sizes="(min-width: 760px) 40vw, 90vw"
              />
            </div>
            <ul>
              {expert.hoje.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Reveal>
        </div>

        <div className="historia">
          {expert.historia.map((paragrafo, i) => (
            <Reveal as="p" key={paragrafo.slice(0, 32)} delay={i * 90}>
              {paragrafo}
            </Reveal>
          ))}
          <Reveal as="p" className="assinatura" delay={expert.historia.length * 90}>
            {expert.assinatura}
            <small>{expert.assinaturaCargo}</small>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
