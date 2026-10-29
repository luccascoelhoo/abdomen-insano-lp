import { funcaoV2 } from '@/content/lp-v2';
import { IconeCheck, IconeX } from './Icones';
import { Rico } from './Rico';

/** [3] Mecanismo da função — escuro: as 2 frentes, a tabela e as perguntas ao Igor. */
export function FuncaoV2() {
  return (
    <section className="v2-sec v2-sec--escuro">
      <div className="v2-col">
        <h2 className="v2-h2">
          {funcaoV2.titulo}
          <span className="v2-h2__linha2">
            <Rico texto={funcaoV2.subtitulo} />
          </span>
        </h2>

        <div className="v2-frentes">
          {funcaoV2.frentes.map((f) => (
            <article key={f.titulo} className="v2-frente">
              <span className="v2-frente__num">{f.numero}</span>
              <h3 className="v2-h3">{f.titulo}</h3>
              <p>
                <Rico texto={f.texto} />
              </p>
            </article>
          ))}
        </div>

        <h3 className="v2-h3 v2-tabela-titulo">{funcaoV2.tabelaTitulo}</h3>
        <table className="v2-tabela">
          <thead>
            <tr>
              {funcaoV2.tabelaColunas.map((c) => (
                <th key={c} scope="col">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {funcaoV2.tabela.map((l) => (
              <tr key={l.fez} className={l.funciona ? 'v2-tabela__ok' : undefined}>
                <th scope="row">
                  {l.funciona ? <IconeCheck /> : <IconeX />}
                  {l.fez}
                </th>
                <td>{l.acontece}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="v2-qa">
          {funcaoV2.perguntas.map((q) => (
            <div key={q.pergunta} className="v2-qa__item">
              <p className="v2-qa__pergunta">“{q.pergunta}”</p>
              {q.respostas.map((r) => (
                <p key={r}>
                  <Rico texto={r} />
                </p>
              ))}
            </div>
          ))}
        </div>

        <p className="v2-fecho">
          <Rico texto={funcaoV2.fecho} />
        </p>
      </div>
    </section>
  );
}
