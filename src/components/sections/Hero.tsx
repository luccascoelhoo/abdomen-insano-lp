import { Fantasma42 } from '@/components/ui/Fantasma42';
import { HeroFoto } from '@/components/ui/HeroFoto';
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
      <Fantasma42 />

      <div className="wrap hero__grid">
        <div>
          {/* Logo colada acima do título, mesma coluna do texto. */}
          <img
            className="hero__logo"
            src="/img/logo-desafio-preta.png"
            alt="Desafio Abdômen Insano"
          />

          {/* Prova social em pill com avatares empilhados, estilo Zyla. */}
          <div className="prova-pill" aria-label="Mais de 5500 alunos já estão no desafio">
            <span className="prova-pill__avatares" aria-hidden="true">
              <span className="prova-pill__av prova-pill__av--1" />
              <span className="prova-pill__av prova-pill__av--2" />
              <span className="prova-pill__av prova-pill__av--3" />
              <span className="prova-pill__av prova-pill__av--4" />
            </span>
            <span className="prova-pill__txt">
              <b>+5.500 alunos</b> já estão no desafio
            </span>
          </div>

          <MaskTitle
            as="h1"
            className="d1"
            linhas={hero.tituloLinhas}
            classesLinha={[
              'linha',
              'linha',
              'linha',
              'linha',
              'linha linha--2',
              'linha linha--2',
              'linha linha--2',
            ]}
          />

          <Reveal as="p" className="hero__sub" delay={220}>
            {hero.subAntes}
            <b>{hero.subDestaque}</b>
            {hero.subDepois}
          </Reveal>

          {/* Provocação vira link textual pra oferta (não botão) — empurra
              a leitura sem duplicar o único CTA da página. */}
          <Reveal as="div" delay={300}>
            {PROVOCACOES_CLICAVEIS ? (
              <a className="provoke" href="#oferta">
                {provocacao}
              </a>
            ) : (
              <p className="provoke">{provocacao}</p>
            )}
          </Reveal>
        </div>

        <Reveal className="hero__coluna-direita" delay={160}>
          <HeroFoto />
        </Reveal>
      </div>
    </section>
  );
}
