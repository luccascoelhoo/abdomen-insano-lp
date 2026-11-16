import type { Parcelamento } from '@/lib/parcelamento';
import { OfertaV2 } from '@/components/v2/OfertaV2';

/** PROVISÓRIO (agente B substitui): blocos de oferta reaproveitados da home. */
export function BlocoOfertaQuiz({ parcelamento }: { parcelamento: Parcelamento }) {
  return <OfertaV2 parcelamento={parcelamento} />;
}
