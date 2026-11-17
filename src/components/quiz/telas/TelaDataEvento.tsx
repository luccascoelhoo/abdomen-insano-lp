'use client';

import type { PropsTela } from '../tipos';

/** PROVISÓRIO: substituir pela roda de datas no estilo do app. */
export function TelaDataEvento({ avancar }: PropsTela) {
  return (
    <section className="quiz-provisorio">
      <button type="button" onClick={avancar}>Continuar</button>
    </section>
  );
}
