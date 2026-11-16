import type { PayloadQuiz } from './tipos';

/**
 * PROVISÓRIO (stub do ramo de telas): a versão real, que manda o payload para
 * `/api/quiz`, é escrita em outro ramo. Mantém a mesma assinatura.
 */
export function enviarQuiz(payload: PayloadQuiz): Promise<void> {
  void payload;
  return Promise.resolve();
}
