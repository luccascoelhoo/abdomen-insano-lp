import { Contador } from '@/components/ui/Contador';
import { Grid42 } from '@/components/ui/Grid42';
import { MaskTitle } from '@/components/ui/MaskTitle';
import { Reveal } from '@/components/ui/Reveal';
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
      {/* Numeral gigante sangrando pela direita, atrás de tudo. */}
      <div className="hero__fantasma" aria-hidden="true">
        42
      </div>

      <div className="wrap hero__grid">
        <div>
          <Reveal as="p" className="rotulo">
            {hero.eyebrow}
          </Reveal>

          <MaskTitle
            as="h1"
            className="d1"
            linhas={hero.tituloLinhas}
            classesLinha={['linha', 'linha', 'linha linha--2', 'linha linha--2']}
          />

          <Reveal as="p" className="hero__sub" delay={220}>
            {hero.subAntes}
            <b>{hero.subDestaque}</b>
            {hero.subDepois}
          </Reveal>

          <Reveal as="div" delay={300}>
            {PROVOCACOES_CLICAVEIS ? (
              <a className="provoke" href="#oferta">
                {provocacao}
              </a>
            ) : (
              <p className="provoke">{provocacao}</p>
            )}
          </Reveal>

          <Reveal className="numeros" delay={380}>
            {hero.numeros.map((n) => (
              <div key={n.rotulo}>
                <Contador ate={n.valor} prefixo={n.prefixo} />
                <span>{n.rotulo}</span>
              </div>
            ))}
          </Reveal>
        </div>

        <Reveal className="malha" delay={160}>
          <div className="malha__topo">
            <span>{hero.malhaCabecalho.esquerda}</span>
            <span>{hero.malhaCabecalho.direita}</span>
          </div>
          <Grid42 />
          <p className="malha__pe">{hero.malhaRodape}</p>
        </Reveal>
      </div>
    </section>
  );
}
