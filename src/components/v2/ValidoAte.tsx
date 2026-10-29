'use client';

import { useEffect, useState } from 'react';

/**
 * "Válido até <hoje>": mostra sempre a data do dia em que a pessoa abre a
 * página (fuso de Brasília), não a data do último deploy. A página é gerada
 * no servidor, então a data só entra depois de montar no navegador; até lá (e
 * sem JavaScript) o texto cai em "Válido até hoje", que continua verdadeiro.
 */
export function ValidoAte() {
  const [hoje, setHoje] = useState<string | null>(null);

  useEffect(() => {
    setHoje(new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }));
  }, []);

  return (
    <p className="v2-valido">
      <span className="v2-valido__ponto" aria-hidden="true" />
      Válido até <strong>{hoje ?? 'hoje'}</strong>
    </p>
  );
}
