import { depoimentosV2 } from '@/content/lp-v2';
import { CarrosselV3 } from '@/components/v3/CarrosselV3';
import { provaV3 } from '@/content/lp-v3';
import { Rico } from './Rico';

/** [5] Depoimentos — antes e depois reais em trilho. */
export function DepoimentosV2() {
  return (
    <section className="v2-sec v2-sec--escuro">
      <div className="v2-col v2-col--largo">
        <h2 className="v2-h2 v2-centro">
          {depoimentosV2.titulo}{' '}
          <span className="v2-acento">
            <Rico texto={depoimentosV2.tituloDestaque} />
          </span>
        </h2>
        <p className="v2-sub v2-centro">{depoimentosV2.sub}</p>
        <CarrosselV3 casos={depoimentosV2.casos} />
        <p className="v3-aviso v2-centro">{provaV3.aviso}</p>
      </div>
    </section>
  );
}
