'use client';

import { useEffect } from 'react';
import { capturarUtmDaUrl } from '@/lib/utm';

/**
 * Componente sem visual — roda uma vez no mount, grava UTM do querystring
 * no localStorage. Injetado no <body> pra estar disponível pra qualquer CTA.
 */
export function UtmCatcher() {
  useEffect(() => {
    capturarUtmDaUrl();
  }, []);
  return null;
}
