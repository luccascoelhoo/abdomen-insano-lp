import { Contador } from '@/components/ui/Contador';
import { CtaButton } from '@/components/ui/CtaButton';
import { Fantasma42 } from '@/components/ui/Fantasma42';
import { HeroFoto } from '@/components/ui/HeroFoto';
import { MaskTitle } from '@/components/ui/MaskTitle';
import { Reveal } from '@/components/ui/Reveal';
import { ctas, hero, microCta } from '@/content/desafio';
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
      <Fantasma42 />

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

          <Reveal as="div" className="hero__cta" delay={360}>
            <CtaButton origem="hero" microcopy={microCta}>
              {ctas.hero}
            </CtaButton>
          </Reveal>

          <Reveal className="numeros" delay={440}>
            {hero.numeros.map((n) => (
              <div key={n.rotulo}>
                <Contador ate={n.valor} prefixo={n.prefixo} duracao={2200} />
                <span>{n.rotulo}</span>
              </div>
            ))}
          </Reveal>
        </div>

        <Reveal className="hero__coluna-direita" delay={160}>
          <HeroFoto />
        </Reveal>
      </div>
    </section>
  );
}
