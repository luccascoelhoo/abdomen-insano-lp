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
import { CtaButton } from '@/components/ui/CtaButton';
import { FaixaV3, FechamentoV3 } from '@/components/v3/Blocos';
import { HeroV3 } from '@/components/v3/HeroV3';
import { oferta } from '@/content/desafio';
import { ofertaV2 } from '@/content/lp-v2';
import { ctaV3 } from '@/content/lp-v3';
import { parcelamentoDaOferta, reais } from '@/lib/parcelamento';
import { ID_FRONT, produtoPorId } from '@/lib/produtos';
import '@/app/v2/v2.css';

/**
 * A página de vendas oficial (V.2): copy nova, desenho modelado em
 * desafio.modocaverna.com/ative. É a home (`/`); a anterior (V.1) está em
 * `/antiga` e na etiqueta `lp-v1-antiga` do Git.
 *
 * Da V.3 (29/10/2026) entraram o topo, a faixa laranja, as perguntas novas
 * do FAQ e o fechamento (responsáveis e carrossel com contador saíram
 * em 30/10). Não entra a barra fixa; o botão do topo voltou em 04/11/2026
 * (sem preço, sem selos), com mais dois pelo caminho: fim do "como funciona"
 * e fim dos casos. As urgências ("por tempo limitado", "válido até hoje")
 * ficam.
 */
export async function LpV2() {
  const slug = produtoPorId(ID_FRONT)?.oferta;
  const parcelamento = (slug ? await parcelamentoDaOferta(slug) : null) ?? ofertaV2.card.reserva;
  const preco = `${parcelamento.vezes}x R$ ${reais(parcelamento.parcelaCentavos)} ou R$ ${reais(parcelamento.avistaCentavos)} à vista`;

  return (
    <div className="v2">
      <ViewContentWatcher moeda={oferta.precoMoeda} />
      <HeroV3>
        <div className="v2-botao-secao">
          <CtaButton className="v2-cta" origem="v2-hero">
            {ctaV3}
          </CtaButton>
        </div>
      </HeroV3>
      <ProblemaV2 />
      <FuncaoV2 />
      <SolucaoV2 />
      <FaixaV3 />
      <DepoimentosV2 />
      <EntregaveisV2 />
      <BeneficiosBonusV2 />
      <OfertaV2 parcelamento={parcelamento} />
      <GarantiaV2 />
      <ExpertV2 parcelamento={parcelamento} />
      <FaqV2 />
      <SuporteV2 />
      <FechamentoV3 preco={preco} origem="v2-fechamento" />
      <RodapeV2 />
    </div>
  );
}
