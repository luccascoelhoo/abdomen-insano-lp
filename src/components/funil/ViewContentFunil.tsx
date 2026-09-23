'use client';

import { useEffect, useRef } from 'react';
import { oferta } from '@/content/desafio';
import { rastrear } from '@/lib/pixel';
import { produtoPorId, type ProdutoId } from '@/lib/produtos';

/**
 * `ViewContent` da oferta pós-compra.
 *
 * Sem ele o upsell é invisível: a página só dispara `PageView`, e `PageView`
 * não distingue quem viu a oferta de quem passou pelo site. É este evento que
 * permite ler a taxa "viu o upsell → comprou o upsell" e separar recusa de
 * quem nunca chegou a ver.
 *
 * O `content_ids` é o do degrau, nunca o do front: o pixel é compartilhado com
 * outro produto do mesmo dono e as conversões personalizadas separam os
 * degraus por produto e valor.
 */
export function ViewContentFunil({ produtoId }: { produtoId: ProdutoId }) {
  const disparado = useRef(false);

  useEffect(() => {
    if (disparado.current) return;
    disparado.current = true;

    const produto = produtoPorId(produtoId);
    if (!produto) return;

    rastrear(
      'ViewContent',
      {
        value: produto.centavos / 100,
        currency: oferta.precoMoeda,
        content_ids: [produto.id],
        content_name: produto.nome,
        content_type: 'product',
      },
      produto.id,
    );
  }, [produtoId]);

  return null;
}
