import { MaskTitle } from '@/components/ui/MaskTitle';
import { Reveal } from '@/components/ui/Reveal';
import { expert } from '@/content/desafio';

export function Expert() {
  return (
    <section className="sec sec--alt">
      <div className="wrap">
        <Reveal as="p" className="rotulo">
          {expert.eyebrow}
        </Reveal>
        <MaskTitle className="d2" linhas={expert.tituloLinhas} />

        <div className="antes-depois">
          <Reveal className="coluna coluna--antes">
            <h3>{expert.antesTitulo}</h3>
            <ul>
              {expert.antes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            {/* Foto "antes" do Igor entra aqui quando o arquivo chegar. */}
          </Reveal>
          <Reveal className="coluna coluna--hoje" delay={120}>
            <h3>{expert.hojeTitulo}</h3>
            <ul>
              {expert.hoje.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            {/* Foto "hoje" do Igor entra aqui quando o arquivo chegar. */}
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
