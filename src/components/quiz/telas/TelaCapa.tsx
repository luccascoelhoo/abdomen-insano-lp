'use client';

import type { PropsTela } from '../tipos';

/** PROVISÓRIO: substituir pela tela 'capa'. */
export function TelaCapa({ tela, avancar }: PropsTela) {
  return (
    <section className="quiz-provisorio">
      <p>Tela provisória: {tela.k}</p>
      <button type="button" onClick={avancar}>Continuar</button>
    </section>
  );
}
