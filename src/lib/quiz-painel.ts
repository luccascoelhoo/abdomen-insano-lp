import { timingSafeEqual } from 'node:crypto';

/** Chave dos painéis do quiz (`QUIZ_PAINEL_CHAVE`), comparada em tempo constante. */
export function chaveOk(recebida: string | undefined): boolean {
  const esperada = process.env.QUIZ_PAINEL_CHAVE;
  if (!esperada || !recebida) return false;
  const a = Buffer.from(recebida);
  const b = Buffer.from(esperada);
  return a.length === b.length && timingSafeEqual(a, b);
}
