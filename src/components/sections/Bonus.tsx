import { Reveal } from '@/components/ui/Reveal';
import { bonus, bonusSecao } from '@/content/desafio';

export function Bonus() {
  return (
    <section className="sec sec--dark" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <Reveal as="p" className="eyebrow">
          {bonusSecao.eyebrow}
        </Reveal>
        <Reveal as="h2" className="h2">
          {bonusSecao.tituloLinhas[0]}
          <br />
          {bonusSecao.tituloLinhas[1]}
        </Reveal>

        <Reveal className="bonus-grid">
          {bonus.map((b) => (
            <article className={b.largo ? 'bonus bonus--wide' : 'bonus'} key={b.titulo}>
              <span className="tag">BÔNUS</span>
              <h3>{b.titulo}</h3>
              <p>{b.texto}</p>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
