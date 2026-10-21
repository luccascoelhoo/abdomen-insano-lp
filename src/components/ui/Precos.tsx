'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { precoDe, produtoPorId, type Precos } from '@/lib/produtos';

/**
 * Leva ao navegador o preço que o servidor leu da Cakto (`lib/precos`).
 *
 * Os eventos do pixel nascem em componentes de cliente, que não podem consultar
 * a Cakto sozinhos sem atrasar o evento. O layout lê uma vez, no servidor, e
 * todos os componentes leem daqui. Fora do provedor, vale o preço do catálogo.
 */
const ContextoPrecos = createContext<Precos>({});

export function PrecosProvider({ precos, children }: { precos: Precos; children: ReactNode }) {
  return <ContextoPrecos.Provider value={precos}>{children}</ContextoPrecos.Provider>;
}

/** Preço em reais do degrau, pronto para o `value` do evento. */
export function usePreco(produtoId: string): number | undefined {
  const precos = useContext(ContextoPrecos);
  const produto = produtoPorId(produtoId);
  return produto ? precoDe(produto, precos) / 100 : undefined;
}
