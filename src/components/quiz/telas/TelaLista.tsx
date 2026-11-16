'use client';

import type { PropsTela } from '../tipos';

/** PROVISÓRIO: substituir pela tela 'lista'. */
export function TelaLista({ tela, avancar }: PropsTela) {
  return (
    <section className="quiz-provisorio">
      <p>Tela provisória: {tela.k}</p>
      <button type="button" onClick={avancar}>Continuar</button>
    </section>
  );
}
