import { textosResultado } from '@/content/quiz';
import type { Parcelamento } from '@/lib/parcelamento';
import { BlocoPreco } from './BlocoPreco';

/** Repetição enxuta do preço no fim da página (o cartão do topo é o card de preço de verdade). */
export function FechamentoOferta({ parcelamento }: { parcelamento: Parcelamento }) {
  return (
    <section className="v2-sec v2-sec--fim qo-fecho">
      <div className="qo-col">
        <h2 className="v2-h2 v2-centro qo-fecho__titulo">{textosResultado.oferta.titulo}</h2>
        <BlocoPreco parcelamento={parcelamento} origem="quiz-oferta-fim" compacto />
      </div>
    </section>
  );
}
