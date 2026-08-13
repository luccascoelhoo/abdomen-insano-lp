import { Reveal } from '@/components/ui/Reveal';
import { expert } from '@/content/desafio';

export function Expert() {
  return (
    <section className="sec sec--alt">
      <div className="wrap">
        <Reveal as="p" className="eyebrow">
          {expert.eyebrow}
        </Reveal>
        <Reveal as="h2" className="h2">
          {expert.tituloLinhas[0]}
          <br />
          {expert.tituloLinhas[1]}
        </Reveal>

        <Reveal className="split">
          <div className="split-col before">
            <h3>{expert.antesTitulo}</h3>
            <ul>
              {expert.antes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            {/* Foto "antes" do Igor entra aqui quando o arquivo chegar. */}
          </div>
          <div className="split-col after">
            <h3>{expert.hojeTitulo}</h3>
            <ul>
              {expert.hoje.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            {/* Foto "hoje" do Igor entra aqui quando o arquivo chegar. */}
          </div>
        </Reveal>

        <Reveal className="story">
          {expert.historia.map((paragrafo) => (
            <p key={paragrafo.slice(0, 32)}>{paragrafo}</p>
          ))}
          <p className="sig">
            {expert.assinatura}
            <small>{expert.assinaturaCargo}</small>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
