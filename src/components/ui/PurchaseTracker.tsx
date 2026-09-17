'use client';

import { useEffect, useRef } from 'react';
import { oferta } from '@/content/desafio';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * `Purchase` no navegador, como redundância do servidor.
 *
 * A fonte da verdade da venda é o webhook do gateway, que sabe que o dinheiro
 * entrou. Este disparo existe para o caso do postback atrasar ou falhar, e usa
 * o **mesmo** `event_id` do lado servidor (`cakto:<transação>`), então o Meta
 * recebe os dois e conta uma venda só.
 *
 * A regra que sustenta isso: **sem id de transação na URL, não dispara.** Um
 * `Purchase` anônimo não deduplica contra nada, e quem recarrega a página
 * contaria de novo. Página de retorno sem identificador é pior que silêncio,
 * porque infla o resultado e a campanha aprende com venda que não existiu.
 */
export function PurchaseTracker({
  transacaoId,
  valor,
}: {
  transacaoId?: string;
  valor?: number;
}) {
  const disparado = useRef(false);

  useEffect(() => {
    if (disparado.current) return;
    const id = transacaoId?.trim();
    if (!id) return;
    disparado.current = true;

    window.fbq?.(
      'track',
      'Purchase',
      {
        value: valor ?? oferta.precoNumero,
        currency: oferta.precoMoeda,
        content_name: 'Desafio Abdômen Insano',
      },
      { eventID: `cakto:${id}` },
    );
  }, [transacaoId, valor]);

  return null;
}
