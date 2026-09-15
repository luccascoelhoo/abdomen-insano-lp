'use client';

import { useEffect, useRef } from 'react';
import { rastrear } from '@/lib/pixel';

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
export function ViewContentWatcher({ valor, moeda }: { valor: number; moeda: string }) {
  const disparado = useRef(false);

  useEffect(() => {
    const marcar = () => {
      if (disparado.current) return;
      disparado.current = true;
      rastrear('ViewContent', {
        content_name: 'Desafio Abdômen Insano',
        value: valor,
        currency: moeda,
      });
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
