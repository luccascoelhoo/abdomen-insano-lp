import { comunidadeV2 } from '@/content/lp-v2';
import { CarrosselCasos } from './CarrosselCasos';
import { Rico } from './Rico';

/** [5b] Comunidade — o desafio é um grupo, não só um app. Mesmo painel das engrenagens. */
export function ComunidadeV2() {
  const c = comunidadeV2;
  return (
    <section className="v2-sec v2-sec--claro">
      <div className="v2-col">
        <h2 className="v2-h2 v2-centro">
          {c.titulo}{' '}
          <span className="v2-acento">
            <Rico texto={c.tituloDestaque} />
          </span>
        </h2>
        <p className="v2-sub v2-centro">
          <Rico texto={c.sub} />
        </p>
        <ol className="v2-engrenagens">
          {c.pilares.map((p) => (
            <li key={p.titulo} className="v2-engrenagem v2-engrenagem--texto">
              <div>
                <p className="v2-engrenagem__rotulo">{p.rotulo}</p>
                <h3 className="v2-h3">{p.titulo}</h3>
                <p>
                  <Rico texto={p.texto} />
                </p>
              </div>
            </li>
          ))}
        </ol>
        {c.prints.length > 0 && <CarrosselCasos casos={c.prints} />}
        <p className="v2-sub v2-centro v2-comunidade__fecho">
          <Rico texto={c.fecho} />
        </p>
      </div>
    </section>
  );
}
