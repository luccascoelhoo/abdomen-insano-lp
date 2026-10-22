'use client';

import { usePreco } from '@/components/ui/Precos';
import { oferta } from '@/content/desafio';
import { ID_FRONT } from '@/lib/produtos';

/**
 * O preço do Desafio, lido VIVO da Cakto.
 *
 * Existe porque o card da oferta trazia o número escrito à mão. Em 21/10/2026
 * a oferta subiu de R$42 para R$64 na Cakto e a página seguiu anunciando 42 —
 * quem clicava aprendia um preço e encontrava outro no checkout. Preço é a
 * única coisa da página que não pode ser cópia: ou vem da mesma fonte que
 * cobra, ou diverge de novo no próximo reajuste.
 *
 * `oferta.precoNumero` é só a rede: vale se a consulta à Cakto falhar.
 */
export function PrecoFront() {
  const preco = usePreco(ID_FRONT) ?? oferta.precoNumero;
  const [inteiro, centavos] = preco.toFixed(2).split('.');

  return (
    <>
      R${inteiro}
      <i>,{centavos}</i>
    </>
  );
}
