'use client';

import { useEffect, useRef } from 'react';
import { rastrear } from '@/lib/pixel';

/**
 * O `PageView`.
 *
 * O snippet base do pixel vive inline no `<head>` (`layout.tsx`), não aqui: no
 * head ele carrega antes, sobrevive a uma hidratação que falhe e — o que mais
 * importa — pode ser conferido de fora, com um GET na página. Script injetado
 * depois da hidratação só se prova com navegador aberto.
 *
 * O que sobra para este componente é o disparo com `event_id`, que precisa de
 * um id gerado por acontecimento. A guarda de ref evita o disparo duplo do
 * StrictMode em desenvolvimento.
 */
export function MetaPixel() {
  const disparado = useRef(false);

  useEffect(() => {
    if (disparado.current) return;
    disparado.current = true;
    rastrear('PageView');
  }, []);

  return null;
}
