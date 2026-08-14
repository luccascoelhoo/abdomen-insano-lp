import Image from 'next/image';
import { MaskTitle } from '@/components/ui/MaskTitle';
import { Rail } from '@/components/ui/Rail';
import { Reveal } from '@/components/ui/Reveal';
import { casos, depoimentos } from '@/content/desafio';
import { IMAGENS_PRONTAS, PROVOCACOES_CLICAVEIS } from '@/lib/flags';

export function Depoimentos() {
  const provocacao = (
    <>
      {depoimentos.provocacaoAntes}
      <span>{depoimentos.provocacaoDestaque}</span>
    </>
  );

  return (
    <section className="sec">
      <div className="wrap">
        <Reveal as="p" className="rotulo">
          {depoimentos.eyebrow}
        </Reveal>
        <MaskTitle className="d2" linhas={depoimentos.tituloLinhas} />
        <Reveal as="p" className="lead" delay={180}>
          {depoimentos.lead}
        </Reveal>

        <Reveal as="p" className="rail__dica" delay={240}>
          arraste para o lado
        </Reveal>
      </div>

      <div className="wrap">
        <Rail>
          {casos.map((caso, i) => (
            <figure className="caso" key={caso.arquivo}>
              {IMAGENS_PRONTAS ? (
                <Image
                  src={caso.arquivo}
                  alt={caso.alt}
                  width={caso.width}
                  height={caso.height}
                  sizes="(min-width: 900px) 340px, 62vw"
                  loading="lazy"
                />
              ) : (
                <div
                  className="caso--vazio"
                  style={{ aspectRatio: `${caso.width} / ${caso.height}` }}
                >
                  caso {String(i + 1).padStart(2, '0')}
                  <br />
                  aguardando foto
                </div>
              )}
              <figcaption>
                {caso.legenda} <span>antes → depois</span>
              </figcaption>
            </figure>
          ))}
        </Rail>
      </div>

      <div className="wrap">
        <Reveal as="div" delay={120}>
          {PROVOCACOES_CLICAVEIS ? (
            <a className="provoke" href="#oferta">
              {provocacao}
            </a>
          ) : (
            <p className="provoke">{provocacao}</p>
          )}
        </Reveal>
      </div>
    </section>
  );
}
