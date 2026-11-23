import type { Parcelamento } from '@/lib/parcelamento';
import { EntregaveisV2 } from '@/components/v2/EntregaveisV2';
import { FaqV2 } from '@/components/v2/FinalV2';
import { GarantiaV2 } from '@/components/v2/GarantiaV2';
import { CartaoPremium } from './oferta/CartaoPremium';
import { FechamentoOferta } from './oferta/FechamentoOferta';

/**
 * A página final do quiz (componente de servidor: o preço vem vivo da Cakto
 * pela página). Ordem: o cartão premium (a oferta e o preço), "Como funciona
 * essa parada?", a garantia, o FAQ e um fechamento enxuto. As 3 engrenagens
 * saíram daqui a pedido do Igor (já aparecem na tela do plano).
 * Todos os botões de compra são o `CtaButton` de sempre (UTMs + InitiateCheckout).
 *
 * Ficam de fora: `OfertaV2`/`CardOferta` (o cartão premium é o card de preço),
 * `BeneficiosBonusV2` (repetiria os bônus já listados no cartão e traz o
 * "válido até") e os blocos com `BotaoRolagem` para `#como-funciona`
 * (DepoimentosV2, FuncaoV2, topo da home). `EntregaveisV2` é o próprio
 * `#como-funciona`, então a âncora existe aqui, mas nenhum botão aponta pra ela.
 */
export function BlocoOfertaQuiz({ parcelamento }: { parcelamento: Parcelamento }) {
  return (
    <div className="v2 qo-blocos">
      <CartaoPremium parcelamento={parcelamento} />
      <EntregaveisV2 />
      <GarantiaV2 />
      <FaqV2 />
      <FechamentoOferta parcelamento={parcelamento} />
    </div>
  );
}
