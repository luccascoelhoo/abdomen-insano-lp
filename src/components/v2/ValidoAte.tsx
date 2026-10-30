'use client';

import { useSyncExternalStore } from 'react';

const nada = () => () => {};
const hojeEmBrasilia = () => new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });

/**
 * "Válido até <hoje>": mostra sempre a data do dia em que a pessoa abre a
 * página (fuso de Brasília), não a data do último deploy. A página é gerada
 * no servidor, então lá (e sem JavaScript) o texto cai em "Válido até hoje",
 * que continua verdadeiro; no navegador entra a data.
 */
export function ValidoAte() {
  const hoje = useSyncExternalStore(nada, hojeEmBrasilia, () => null);

  return (
    <p className="v2-valido">
      <span className="v2-valido__ponto" aria-hidden="true" />
      Válido até <strong>{hoje ?? 'hoje'}</strong>
    </p>
  );
}
