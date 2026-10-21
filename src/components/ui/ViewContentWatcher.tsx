'use client';

import { useEffect, useRef } from 'react';
import { rastrear } from '@/lib/pixel';
import { ID_FRONT } from '@/lib/produtos';
import { usePreco } from '@/components/ui/Precos';

/**
 * `ViewContent` — quem leu a oferta, e não quem bateu e saiu.
 *
 * Dispara uma única vez, no que vier primeiro: 50% da página rolada ou 15
 * segundos de permanência. Rolagem sozinha perde quem lê devagar no topo;
 * tempo sozinho conta aba aberta e esquecida. Os dois juntos separam leitura
 * de passagem melhor que qualquer um dos dois isolado.
 *
 * Vive só na home. A `/obrigado` não tem oferta para ser lida.
 */
export function ViewContentWatcher({ moeda }: { moeda: string }) {
  const disparado = useRef(false);
  // Preço vivo da Cakto; o de referência só se o layout não conseguiu ler.
  const valor = usePreco(ID_FRONT);

  useEffect(() => {
    const marcar = () => {
      if (disparado.current) return;
      disparado.current = true;
      rastrear(
        'ViewContent',
        {
          content_ids: [ID_FRONT],
          content_name: 'Desafio Abdômen Insano',
          content_type: 'product',
          value: valor,
          currency: moeda,
        },
        ID_FRONT,
      );
      window.removeEventListener('scroll', aoRolar);
      clearTimeout(relogio);
    };

    const aoRolar = () => {
      const altura = document.documentElement.scrollHeight - window.innerHeight;
      if (altura <= 0) return;
      if (window.scrollY / altura >= 0.5) marcar();
    };

    const relogio = setTimeout(marcar, 15_000);
    window.addEventListener('scroll', aoRolar, { passive: true });
    return () => {
      window.removeEventListener('scroll', aoRolar);
      clearTimeout(relogio);
    };
  }, [valor, moeda]);

  return null;
}
