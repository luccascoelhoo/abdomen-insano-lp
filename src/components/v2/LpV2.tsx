import { BeneficiosBonusV2 } from '@/components/v2/BeneficiosBonusV2';
import { DepoimentosV2 } from '@/components/v2/DepoimentosV2';
import { EntregaveisV2 } from '@/components/v2/EntregaveisV2';
import { ExpertV2 } from '@/components/v2/ExpertV2';
import { FaqV2, RodapeV2, SuporteV2 } from '@/components/v2/FinalV2';
import { FuncaoV2 } from '@/components/v2/FuncaoV2';
import { GarantiaV2 } from '@/components/v2/GarantiaV2';
import { OfertaV2 } from '@/components/v2/OfertaV2';
import { ProblemaV2 } from '@/components/v2/ProblemaV2';
import { SolucaoV2 } from '@/components/v2/SolucaoV2';
import { ViewContentWatcher } from '@/components/ui/ViewContentWatcher';
import { HeroV3 } from '@/components/v3/HeroV3';
import { oferta } from '@/content/desafio';
import { ofertaV2 } from '@/content/lp-v2';
import { parcelamentoDaOferta } from '@/lib/parcelamento';
import { ID_FRONT, produtoPorId } from '@/lib/produtos';
import '@/app/v2/v2.css';

/**
 * A página de vendas oficial (V.2): copy nova, desenho modelado em
 * desafio.modocaverna.com/ative. É a home (`/`); a anterior (V.1) está em
 * `/antiga` e na etiqueta `lp-v1-antiga` do Git.
 */
export async function LpV2() {
  const slug = produtoPorId(ID_FRONT)?.oferta;
  const parcelamento = (slug ? await parcelamentoDaOferta(slug) : null) ?? ofertaV2.card.reserva;

  return (
    <div className="v2">
      <ViewContentWatcher moeda={oferta.precoMoeda} />
      <HeroV3 />
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
