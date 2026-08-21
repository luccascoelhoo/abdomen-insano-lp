import Image from 'next/image';
import { DepoimentosPin } from '@/components/ui/DepoimentosPin';
import { MaskTitle } from '@/components/ui/MaskTitle';
import { Rail } from '@/components/ui/Rail';
import { Reveal } from '@/components/ui/Reveal';
import { casos, depoimentos } from '@/content/desafio';
import { IMAGENS_PRONTAS } from '@/lib/flags';

export function Depoimentos() {
  return (
    <section className="sec depoimentos-sec">
      <div className="wrap">
        <MaskTitle className="d2" linhas={depoimentos.tituloLinhas} />
        <Reveal as="p" className="lead" delay={180}>
          {depoimentos.lead}
        </Reveal>
      </div>

      {/* Desktop: scroll horizontal pinned. O DepoimentosPin faz o layout do
          trilho e mede o scroll pra puxar as fotos enquanto a section está
          na tela. Só ativa em >= 900px (CSS .dep-pin__trilho controla). */}
      <DepoimentosPin />

      {/* Mobile: trilho arrastável nativo. O DepoimentosPin acima esconde
          esta faixa no desktop via CSS pra evitar duplicação. */}
      <div className="wrap depoimentos-mobile">
        <Reveal as="p" className="rail__dica" delay={240}>
          arraste para o lado
        </Reveal>
        <Rail>
          {casos.map((caso, i) => (
            <figure className="caso" key={caso.arquivo}>
              {IMAGENS_PRONTAS ? (
                <Image
                  src={caso.arquivo}
                  alt={caso.alt}
                  width={caso.width}
                  height={caso.height}
                  sizes="62vw"
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
                <span>antes → depois</span>
              </figcaption>
            </figure>
          ))}
        </Rail>
      </div>
    </section>
  );
}
