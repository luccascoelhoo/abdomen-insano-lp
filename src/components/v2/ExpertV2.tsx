import Image from 'next/image';
import { expertV2 } from '@/content/lp-v2';
import type { Parcelamento } from '@/lib/parcelamento';
import { CardOferta } from './CardOferta';
import { IconeCheck, IconeProibido } from './Icones';
import { Rico } from './Rico';

/**
 * [11] O idealizador — "de um lado / do outro" com as duas fotos, a história,
 * e o card de compra de novo no fim, como a referência faz depois do expert.
 */
export function ExpertV2({ parcelamento }: { parcelamento: Parcelamento }) {
  const e = expertV2;
  return (
    <section className="v2-sec v2-sec--preto">
      <div className="v2-col">
        <h2 className="v2-h2 v2-centro">
          {e.titulo} <span className="v2-acento">{e.tituloDestaque}</span>
        </h2>

        <div className="v2-lados">
          {[e.antes, e.depois].map((lado, i) => (
            <div key={lado.rotulo} className="v2-lado">
              <div className="v2-lado__foto">
                <Image
                  src={lado.foto.src}
                  alt={lado.foto.alt}
                  width={lado.foto.width}
                  height={lado.foto.height}
                  sizes="(max-width: 720px) 45vw, 320px"
                />
              </div>
              <p className="v2-lado__rotulo">{lado.rotulo}</p>
              <ul className={`v2-lado__itens ${i === 0 ? 'v2-lado__itens--antes' : 'v2-lado__itens--depois'}`}>
                {lado.itens.map((item) => (
                  <li key={item}>
                    {i === 0 ? <IconeProibido /> : <IconeCheck />}
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="v2-texto v2-texto--escuro">
          {e.bio.map((p) => (
            <p key={p}>
              <Rico texto={p} />
            </p>
          ))}
        </div>

        <CardOferta parcelamento={parcelamento} origem="v2-oferta-final" />
      </div>
    </section>
  );
}
