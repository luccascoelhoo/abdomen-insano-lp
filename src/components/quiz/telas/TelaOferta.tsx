'use client';

import type { ReactNode } from 'react';
import type { PropsTela } from '../tipos';

/** PROVISÓRIO: substituir pela tela 'oferta'. */
export function TelaOferta({ tela, avancar, oferta }: PropsTela & { oferta: ReactNode }) {
  return (
    <section className="quiz-provisorio">
      <p>Tela provisória: {tela.k}</p>
      {oferta}
      <button type="button" onClick={avancar}>Continuar</button>
    </section>
  );
}
