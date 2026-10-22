'use client';

import { usePrecoCentavos } from '@/components/ui/Precos';

/**
 * O "em N%" do título do downsell, calculado dos preços vivos da Cakto.
 *
 * Existe porque o número estava escrito à mão como "35%", e ele só é verdade
 * enquanto o par de preços não muda: com o upsell a R$ 197, o downsell a
 * R$ 127 dá 35%, mas a R$ 147 dá 25%. Prometer 35% e cobrar 25% a menos é a
 * mesma classe de divergência que o preço do front tinha.
 *
 * Se algum dos dois preços não vier, não renderiza nada — e o título fica
 * "Aumentei o seu desconto", que continua uma frase inteira e verdadeira.
 */
export function DescontoDinamico({
  base,
  oferta,
  cheioCentavos,
}: {
  base: string;
  oferta: string;
  /** Âncora declarada. Quando existe, vence o preço do degrau anterior. */
  cheioCentavos?: number;
}) {
  const precoDoDegrau = usePrecoCentavos(base);
  const precoOferta = usePrecoCentavos(oferta);
  const precoBase = cheioCentavos ?? precoDoDegrau;

  if (!precoBase || !precoOferta || precoOferta >= precoBase) return null;

  // Arredonda para BAIXO de propósito: 35,5% vira 35%, não 36%. Desconto
  // arredondado para cima é promessa que o preço não cumpre.
  const porcento = Math.floor((1 - precoOferta / precoBase) * 100);
  if (porcento < 1) return null;

  return (
    <>
      {' em '}
      <span>{porcento}%</span>
    </>
  );
}
