import { BotaoRolagem } from './BotaoRolagem';
import { comunidadeV2 } from '@/content/lp-v2';
import { CarrosselCasos } from './CarrosselCasos';
import { Rico } from './Rico';

/** [5b] Comunidade — o desafio é um grupo, não só um app. */
export function ComunidadeV2() {
  const c = comunidadeV2;
  return (
    <section className="v2-sec v2-sec--claro v2-comunidade">
      <div className="v2-col v2-col--largo">
        <h2 className="v2-h2 v2-centro">
          {c.titulo}{' '}
          <span className="v2-acento">
            <Rico texto={c.tituloDestaque} />
          </span>
        </h2>
        <p className="v2-sub v2-centro">
          <Rico texto={c.sub} />
        </p>
        <ul className="v2-comunidade__pilares">
          {c.pilares.map((p) => (
            <li key={p.titulo} className="v2-comunidade__pilar">
              <h3>{p.titulo}</h3>
              <p>{p.texto}</p>
            </li>
          ))}
        </ul>
        {c.prints.length > 0 && <CarrosselCasos casos={c.prints} />}
        <p className="v2-comunidade__fecho v2-centro">
          <Rico texto={c.fecho} />
        </p>
        <div className="v2-botao-secao">
          <BotaoRolagem alvo="como-funciona">{c.cta}</BotaoRolagem>
        </div>
      </div>
    </section>
  );
}
