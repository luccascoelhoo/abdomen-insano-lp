import type { PayloadQuiz } from './tipos';

/** O envio nunca segura a pessoa: passou disso, desiste. */
const TEMPO_MAXIMO_MS = 4000;

/**
 * Manda as respostas do quiz para `/api/quiz`. Fogo e esquece: chamado sem
 * `await`, nunca rejeita e nunca lança. `keepalive` deixa a requisição
 * terminar mesmo que a página navegue para o checkout logo em seguida.
 */
export function enviarQuiz(payload: PayloadQuiz): Promise<void> {
  try {
    const controle = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = controle ? setTimeout(() => controle.abort(), TEMPO_MAXIMO_MS) : null;
    return fetch('/api/quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
      credentials: 'same-origin',
      signal: controle?.signal,
    })
      .then((r) => {
        if (!r.ok) avisar(`status ${r.status}`);
      })
      .catch((e: unknown) => avisar(e))
      .finally(() => {
        if (timer) clearTimeout(timer);
      });
  } catch (e) {
    avisar(e);
    return Promise.resolve();
  }
}

function avisar(motivo: unknown): void {
  if (process.env.NODE_ENV !== 'production') console.warn('[quiz] envio falhou', motivo);
}
