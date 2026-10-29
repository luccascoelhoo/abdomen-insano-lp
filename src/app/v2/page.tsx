import type { Metadata } from 'next';
import { BeneficiosBonusV2 } from '@/components/v2/BeneficiosBonusV2';
import { DepoimentosV2 } from '@/components/v2/DepoimentosV2';
import { EntregaveisV2 } from '@/components/v2/EntregaveisV2';
import { ExpertV2 } from '@/components/v2/ExpertV2';
import { FaqV2, RodapeV2, SuporteV2 } from '@/components/v2/FinalV2';
import { FuncaoV2 } from '@/components/v2/FuncaoV2';
import { GarantiaV2 } from '@/components/v2/GarantiaV2';
import { HeroV2 } from '@/components/v2/HeroV2';
import { OfertaV2 } from '@/components/v2/OfertaV2';
import { ProblemaV2 } from '@/components/v2/ProblemaV2';
import { SolucaoV2 } from '@/components/v2/SolucaoV2';
import { ViewContentWatcher } from '@/components/ui/ViewContentWatcher';
import { marca, oferta } from '@/content/desafio';
import { ofertaV2 } from '@/content/lp-v2';
import { parcelamentoDaOferta } from '@/lib/parcelamento';
import { ID_FRONT, produtoPorId } from '@/lib/produtos';
import './v2.css';

/**
 * LP V.2 — copy nova, desenho modelado em desafio.modocaverna.com/ative.
 *
 * Mora em /v2 enquanto é revisada: a home (/) continua com a página atual e
 * os anúncios não mudam. Fora do índice até virar a home.
 */
export const metadata: Metadata = {
  title: marca.titulo,
  description: marca.descricao,
  robots: { index: false, follow: false },
};

export default async function LpV2() {
  const slug = produtoPorId(ID_FRONT)?.oferta;
  const parcelamento = (slug ? await parcelamentoDaOferta(slug) : null) ?? ofertaV2.card.reserva;

  return (
    <div className="v2">
      <ViewContentWatcher moeda={oferta.precoMoeda} />
      <HeroV2 />
      <ProblemaV2 />
      <FuncaoV2 />
      <SolucaoV2 />
      <DepoimentosV2 />
      <EntregaveisV2 />
      <BeneficiosBonusV2 />
      <OfertaV2 parcelamento={parcelamento} />
      <GarantiaV2 />
      <ExpertV2 parcelamento={parcelamento} />
      <FaqV2 />
      <SuporteV2 />
      <RodapeV2 />
    </div>
  );
}
