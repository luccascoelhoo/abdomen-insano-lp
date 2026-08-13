import { Grid42 } from '@/components/ui/Grid42';
import { hero } from '@/content/desafio';
import { PROVOCACOES_CLICAVEIS } from '@/lib/flags';

export function Hero() {
  const provocacao = (
    <>
      {hero.provocacaoAntes}
      <span>{hero.provocacaoDestaque}</span>
    </>
  );

  return (
    <section className="hero">
      <div className="wrap hero-grid">
        <div>
          <p className="eyebrow">{hero.eyebrow}</p>
          <h1>
            {hero.tituloAntes}
            <span className="hl">{hero.tituloDestaque}</span>
          </h1>
          <p className="sub">
            {hero.subAntes}
            <b>{hero.subDestaque}</b>
            {hero.subDepois}
          </p>

          {PROVOCACOES_CLICAVEIS ? (
            <a className="provoke" href="#oferta">
              {provocacao}
            </a>
          ) : (
            <p className="provoke">{provocacao}</p>
          )}

          <div className="stat-row">
            {hero.numeros.map((n) => (
              <span key={n.rotulo}>
                <b>{n.valor}</b> {n.rotulo}
              </span>
            ))}
          </div>
        </div>

        <div className="grid42-box">
          <div className="grid42-head">
            <span>{hero.malhaCabecalho.esquerda}</span>
            <span>{hero.malhaCabecalho.direita}</span>
          </div>
          <Grid42 />
          <p className="grid42-foot">{hero.malhaRodape}</p>
        </div>
      </div>
    </section>
  );
}
