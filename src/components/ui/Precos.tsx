'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { precoDe, produtoPorId, type Precos, type Recorrencia, type Recorrencias } from '@/lib/produtos';

/**
 * Leva ao navegador o preço que o servidor leu da Cakto (`lib/precos`).
 *
 * Os eventos do pixel nascem em componentes de cliente, que não podem consultar
 * a Cakto sozinhos sem atrasar o evento. O layout lê uma vez, no servidor, e
 * todos os componentes leem daqui. Fora do provedor, vale o preço do catálogo.
 */
const ContextoPrecos = createContext<Precos>({});
const ContextoRecorrencias = createContext<Recorrencias>({});

export function PrecosProvider({
  precos,
  recorrencias = {},
  children,
}: {
  precos: Precos;
  recorrencias?: Recorrencias;
  children: ReactNode;
}) {
  return (
    <ContextoPrecos.Provider value={precos}>
      <ContextoRecorrencias.Provider value={recorrencias}>{children}</ContextoRecorrencias.Provider>
    </ContextoPrecos.Provider>
  );
}

/** Como a Cakto cobra este degrau. `undefined` = não deu para ler. */
export function useRecorrencia(produtoId: string): Recorrencia | undefined {
  return useContext(ContextoRecorrencias)[produtoId];
}

/** Preço em CENTAVOS do degrau — para montar texto, não evento. */
export function usePrecoCentavos(produtoId: string): number | undefined {
  const precos = useContext(ContextoPrecos);
  const produto = produtoPorId(produtoId);
  return produto ? precoDe(produto, precos) : undefined;
}

/** Preço em reais do degrau, pronto para o `value` do evento. */
export function usePreco(produtoId: string): number | undefined {
  const precos = useContext(ContextoPrecos);
  const produto = produtoPorId(produtoId);
  return produto ? precoDe(produto, precos) / 100 : undefined;
}
