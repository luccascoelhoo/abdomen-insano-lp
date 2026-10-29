import { problemaV2 } from '@/content/lp-v2';
import { Rico } from './Rico';

/** [2] Mecanismo do problema — fundo claro, a "capa" de gordura e as consequências. */
export function ProblemaV2() {
  return (
    <section className="v2-sec v2-sec--claro">
      <div className="v2-col">
        <h2 className="v2-h2 v2-centro">
          {problemaV2.tituloAntes}
          <br />
          <span className="v2-acento">
            <Rico texto={problemaV2.tituloDestaque} />
          </span>
        </h2>

        <div className="v2-texto">
          {problemaV2.paragrafos.map((p) => (
            <p key={p}>
              <Rico texto={p} />
            </p>
          ))}
        </div>

        <p className="v2-capa">
          <Rico texto={problemaV2.capa} />
        </p>

        <div className="v2-texto">
          <p>{problemaV2.explicacao}</p>
        </div>
        <p className="v2-punch">{problemaV2.punch}</p>
        <p className="v2-tempo">
          {problemaV2.tempo[0]}
          <br />
          <b>{problemaV2.tempo[1]}</b>
        </p>

        <p className="v2-lead">{problemaV2.consequenciasLead}</p>
        <ul className="v2-caixas">
          {problemaV2.consequencias.map((c) => (
            <li key={c} className="v2-caixa">
              <Rico texto={c} />
            </li>
          ))}
        </ul>

        <p className="v2-faixa">
          <span>{problemaV2.faixa}</span>
        </p>
      </div>
    </section>
  );
}
