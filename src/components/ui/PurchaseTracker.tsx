'use client';

import { useEffect, useRef } from 'react';
import { oferta } from '@/content/desafio';
import { PIXEL_ID } from '@/lib/pixel';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    dataLayer?: Record<string, unknown>[];
  }
}

/** Quantas vezes perguntar ao servidor, e de quanto em quanto tempo. */
const TENTATIVAS = 6;
const INTERVALO_MS = 2500;

type Resposta = {
  ok?: boolean;
  conhecida?: boolean;
  aprovada?: boolean;
  valor?: number;
  event_id?: string;
};

/**
 * `Purchase` no navegador, como redundância do servidor.
 *
 * A fonte da verdade da venda é o webhook do gateway, que sabe que o dinheiro
 * entrou. Este disparo existe para o caso de a Conversions API falhar depois de
 * a venda já estar gravada — aí o navegador é a segunda chance de medir.
 *
 * O id **não** é derivado da URL. A página lê o identificador que o gateway pôs
 * na URL de retorno, e o webhook lê o que ele pôs no corpo do postback; se os
 * dois campos não forem o mesmo valor, cada lado dispararia um id diferente e a
 * mesma venda contaria duas vezes. Então o navegador pergunta ao servidor qual
 * `event_id` ele registrou, e dispara só com esse.
 *
 * Enquanto o postback não chega, a resposta é "não conheço" e nada é disparado.
 * Isso é deliberado: venda que o servidor não viu também não foi gravada, e
 * esse defeito precisa aparecer no funil, não ser mascarado por um evento solto
 * que ninguém consegue casar depois.
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
    const id = transacaoId?.trim();
    if (!id || disparado.current) return;
    // O funil (upsell → downsell → /obrigado) carrega a mesma transação de
    // página em página; ela é medida uma vez só por sessão.
    const chaveSessao = `ai_purchase_${id}`;
    try {
      if (sessionStorage.getItem(chaveSessao)) return;
    } catch {
      /* storage bloqueado — segue, o event_id ainda deduplica no Meta */
    }

    let vivo = true;
    let relogio: ReturnType<typeof setTimeout>;

    const perguntar = async (tentativa: number) => {
      if (!vivo || disparado.current) return;

      let dados: Resposta | null = null;
      try {
        const r = await fetch('/api/compra/status', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ transacao_id: id }),
        });
        // Resposta fora do 2xx não é "venda inexistente", é falha de consulta.
        if (r.ok) dados = (await r.json()) as Resposta;
      } catch {
        /* rede caiu: trata como ainda não conhecida e tenta de novo */
      }

      if (!vivo) return;

      if (dados?.conhecida && dados.aprovada && dados.event_id) {
        disparado.current = true;
        try {
          sessionStorage.setItem(chaveSessao, '1');
        } catch {}
        const valorFinal = dados.valor ?? valor ?? oferta.precoNumero;
        window.fbq?.(
          'trackSingle',
          PIXEL_ID,
          'Purchase',
          {
            value: valorFinal,
            currency: oferta.precoMoeda,
            content_name: 'Desafio Abdômen Insano',
          },
          { eventID: dados.event_id },
        );
        // O mesmo fato para o container: o `purchase` do GA4 passa a nascer
        // daqui, com a transação confirmada pelo servidor, e não de qualquer
        // carregamento da /obrigado. A tag do container escuta
        // `purchase_confirmada`.
        window.dataLayer = window.dataLayer ?? [];
        window.dataLayer.push({
          event: 'purchase_confirmada',
          transaction_id: id,
          value: valorFinal,
          currency: oferta.precoMoeda,
        });
        return;
      }

      if (tentativa + 1 < TENTATIVAS) {
        relogio = setTimeout(() => void perguntar(tentativa + 1), INTERVALO_MS);
      }
    };

    void perguntar(0);

    return () => {
      vivo = false;
      clearTimeout(relogio);
    };
  }, [transacaoId, valor]);

  return null;
}
