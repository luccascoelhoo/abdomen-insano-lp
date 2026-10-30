import Image from 'next/image';
import { entregaveisV2 } from '@/content/lp-v2';
import { CelularVideo } from './CelularVideo';
import { Rico } from './Rico';

/**
 * [6] Entregáveis — o passo a passo em linha do tempo, como na referência:
 * cartões alternando de lado no desktop, com a palavra do passo grande e
 * desfocada no lado vazio; no celular, uma coluna com a linha à esquerda.
 * Cada passo mostra a gravação real do app num iPhone.
 */
export function EntregaveisV2() {
  return (
    <section className="v2-sec v2-sec--preto">
      <div className="v2-col v2-col--largo">
        <h2 className="v2-h2">
          {entregaveisV2.titulo} <span className="v2-acento">{entregaveisV2.tituloDestaque}</span>
        </h2>
        <p className="v2-sub">
          <Rico texto={entregaveisV2.sub} />
        </p>

        <ol className="v2-timeline">
          {entregaveisV2.passos.map((p, i) => (
            <li key={p.titulo} className={`v2-passo ${i % 2 === 0 ? 'v2-passo--dir' : 'v2-passo--esq'}`}>
              <span className="v2-passo__fundo" aria-hidden="true">
                {p.fundo}
              </span>
              <span className="v2-passo__ponto" aria-hidden="true" />
              <div className="v2-passo__card">
                <h3 className="v2-h3">
                  <span className="v2-acento">{i + 1}.</span> {p.titulo}
                </h3>
                <p>{p.texto}</p>
                {'video' in p && p.video && (
                  <div className="v2-passo__img v2-passo__img--iphone">
                    <CelularVideo video={p.video} rotulo={`O app na prática: ${p.titulo.toLowerCase()}`} />
                  </div>
                )}
                {'imagem' in p && p.imagem && (
                  <div className="v2-passo__img">
                    <Image
                      src={p.imagem.src}
                      alt={p.imagem.alt}
                      width={p.imagem.width}
                      height={p.imagem.height}
                      sizes="(max-width: 900px) 70vw, 300px"
                    />
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
