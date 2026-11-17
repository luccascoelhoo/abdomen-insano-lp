import type { Parcelamento } from '@/lib/parcelamento';
import { BeneficiosBonusV2 } from '@/components/v2/BeneficiosBonusV2';
import { FaqV2 } from '@/components/v2/FinalV2';
import { GarantiaV2 } from '@/components/v2/GarantiaV2';
import { OfertaV2 } from '@/components/v2/OfertaV2';

/**
 * Os blocos de venda da home, reaproveitados no fim do quiz (componentes de
 * servidor; o preço vem vivo da Cakto pela página). Todos os botões de compra
 * são o `CtaButton` de sempre (UTMs + InitiateCheckout).
 *
 * Ficam de fora os blocos com `BotaoRolagem` para `#como-funciona`, âncora que
 * não existe no /quiz (DepoimentosV2, FuncaoV2, o topo da home).
 */
export function BlocoOfertaQuiz({ parcelamento }: { parcelamento: Parcelamento }) {
  return (
    <div className="v2 qr-blocos">
      <OfertaV2 parcelamento={parcelamento} />
      <BeneficiosBonusV2 />
      <GarantiaV2 />
      <FaqV2 />
    </div>
  );
}
