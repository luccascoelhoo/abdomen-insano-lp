import Image from 'next/image';
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
        <Reveal as="p" className="eyebrow">
          {depoimentos.eyebrow}
        </Reveal>
        <Reveal as="h2" className="h2">
          {depoimentos.tituloLinhas[0]}
          <br />
          {depoimentos.tituloLinhas[1]}
        </Reveal>
        <Reveal as="p" className="lead lead--top">
          {depoimentos.lead}
        </Reveal>

        <Reveal className="cases">
          {casos.map((caso, i) => (
            <figure className="case" key={caso.arquivo}>
              {IMAGENS_PRONTAS ? (
                <Image
                  src={caso.arquivo}
                  alt={caso.alt}
                  width={caso.width}
                  height={caso.height}
                  sizes="(min-width: 860px) 33vw, 50vw"
                  loading="lazy"
                />
              ) : (
                <div
                  className="case--vazio"
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
        </Reveal>

        {PROVOCACOES_CLICAVEIS ? (
          <Reveal as="div">
            <a className="provoke provoke--late" href="#oferta">
              {provocacao}
            </a>
          </Reveal>
        ) : (
          <Reveal as="p" className="provoke provoke--late">
            {provocacao}
          </Reveal>
        )}
      </div>
    </section>
  );
}
