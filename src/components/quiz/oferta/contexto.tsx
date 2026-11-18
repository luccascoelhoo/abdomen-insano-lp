'use client';

import { createContext, useContext } from 'react';
import type { Respostas, Tela } from '../tipos';

/**
 * Ponte entre a tela (cliente, tem as respostas) e os blocos da oferta, que
 * chegam renderizados do servidor em `oferta`. A tela abre o contexto em volta
 * de `{oferta}`; os componentes de cliente lá dentro (o cartão premium) leem.
 */
export interface DadosOferta {
  respostas: Respostas;
  irPara?: (k: Tela['k']) => void;
}

const ContextoOferta = createContext<DadosOferta>({ respostas: {} });

export const ProvedorOferta = ContextoOferta.Provider;

export function useDadosOferta(): DadosOferta {
  return useContext(ContextoOferta);
}
