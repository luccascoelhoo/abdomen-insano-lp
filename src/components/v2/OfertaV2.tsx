import { ofertaV2 } from '@/content/lp-v2';
import type { Parcelamento } from '@/lib/parcelamento';
import { CardOferta } from './CardOferta';
import { Rico } from './Rico';

/** [9] Oferta — a narrativa do preço e o card de compra. `id="oferta"` é a âncora do preço. */
export function OfertaV2({ parcelamento }: { parcelamento: Parcelamento }) {
  const n = ofertaV2.narrativa;
  return (
    <section className="v2-sec v2-sec--preto v2-oferta" id="oferta">
      <div className="v2-col v2-centro">
        <p className="v2-oferta__pergunta">
          <Rico texto={n.pergunta} />
        </p>
        <h2 className="v2-h2">
          <Rico texto={n.promessa} />
        </h2>
        <p className="v2-oferta__chamada">{n.chamada}</p>
        <p>
          <Rico texto={n.reforco} />
        </p>
        <p>{n.fecho}</p>
        <p className="v2-oferta__lema">{n.lema}</p>
        <CardOferta parcelamento={parcelamento} origem="v2-oferta" />
      </div>
    </section>
  );
}
