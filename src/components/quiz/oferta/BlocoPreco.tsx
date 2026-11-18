import { CtaButton } from '@/components/ui/CtaButton';
import { ofertaV2 } from '@/content/lp-v2';
import { PRECO_REFERENCIA_CENTAVOS, brl, descontoPercentual } from '@/lib/desconto';
import { reais, type Parcelamento } from '@/lib/parcelamento';
import { IconeCadeado, IconeEscudo } from './icones';

/**
 * O preço, no molde da referência: VALOR TOTAL, o preço antigo riscado, o
 * desconto, a parcela grande, o à vista e o botão. É a mesma conta da página de
 * vendas (R$ 299 riscado) e o parcelamento vivo da Cakto. O botão é o
 * `CtaButton` de sempre (UTMs + InitiateCheckout); só o `origem` muda.
 *
 * `compacto` é a repetição do fim da página: sem o rótulo e sem a garantia.
 */
export function BlocoPreco({
  parcelamento,
  origem,
  compacto = false,
  garantia = true,
}: {
  parcelamento: Parcelamento;
  origem: string;
  compacto?: boolean;
  garantia?: boolean;
}) {
  const pct = descontoPercentual(parcelamento.avistaCentavos);
  const parcelado = parcelamento.vezes > 1;

  return (
    <div className={`qo-preco${compacto ? ' qo-preco--compacto' : ''}`}>
      {!compacto && <p className="qo-preco__rotulo">Valor total</p>}

      {pct > 0 && (
        <p className="qo-preco__de">
          <s>{brl(PRECO_REFERENCIA_CENTAVOS)}</s>
          <span className="qo-preco__pct">com {pct}% de desconto</span>
        </p>
      )}

      <p className="qo-preco__principal">
        {parcelado ? (
          <>
            <span className="qo-preco__vezes">{parcelamento.vezes}x</span>
            <span className="qo-preco__moeda">R$</span>
            <span className="qo-preco__valor">{reais(parcelamento.parcelaCentavos)}</span>
          </>
        ) : (
          <>
            <span className="qo-preco__moeda">R$</span>
            <span className="qo-preco__valor">{reais(parcelamento.avistaCentavos)}</span>
          </>
        )}
      </p>
      {parcelado && (
        <p className="qo-preco__avista">
          ou <b>R$ {reais(parcelamento.avistaCentavos)}</b> à vista
        </p>
      )}

      <CtaButton className="v2-cta qo-cta" origem={origem}>
        {ofertaV2.card.cta}
      </CtaButton>

      <p className="qo-preco__seguro">
        <IconeCadeado className="qo-preco__icone" />
        Pagamento seguro · acesso imediato ao app
      </p>

      {garantia && !compacto && (
        <p className="qo-preco__garantia">
          <IconeEscudo className="qo-preco__icone" />
          <span>
            <b>Garantia incondicional de 15 dias.</b> Se não ficar satisfeito, você pede o dinheiro de volta.
          </span>
        </p>
      )}
    </div>
  );
}
