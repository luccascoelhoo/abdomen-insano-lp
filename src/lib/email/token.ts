import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Links assinados dos e-mails do quiz (confirmar o aceite, sair da lista).
 * Quem clica prova que recebeu o e-mail naquele endereço: é isso que torna o
 * aceite válido (dupla confirmação). Sem banco: e-mail + ação + validade,
 * assinados com HMAC-SHA256 (env QUIZ_TOKEN_SECRET).
 */

export type AcaoEmail = 'confirmar' | 'sair';

const b64 = (b: Buffer | string) => Buffer.from(b).toString('base64url');

function segredo(): string | null {
  const s = process.env.QUIZ_TOKEN_SECRET;
  return s && s.length >= 32 ? s : null;
}

export function tokenConfigurado(): boolean {
  return segredo() !== null;
}

/** Validade padrão: confirmar 14 dias; sair 365 dias (vai em todo e-mail). */
export function assinar(email: string, acao: AcaoEmail, dias = acao === 'sair' ? 365 : 14): string | null {
  const s = segredo();
  if (!s) return null;
  const exp = Math.floor(Date.now() / 1000) + dias * 86_400;
  const dados = b64(JSON.stringify({ e: email.toLowerCase(), a: acao, x: exp }));
  const sig = b64(createHmac('sha256', s).update(dados).digest());
  return `${dados}.${sig}`;
}

export function verificar(token: string, acao: AcaoEmail): string | null {
  const s = segredo();
  if (!s || typeof token !== 'string' || token.length > 600) return null;
  const [dados, sig] = token.split('.');
  if (!dados || !sig) return null;
  const esperado = createHmac('sha256', s).update(dados).digest();
  const recebido = Buffer.from(sig, 'base64url');
  if (recebido.length !== esperado.length || !timingSafeEqual(recebido, esperado)) return null;
  try {
    const p = JSON.parse(Buffer.from(dados, 'base64url').toString('utf8')) as { e?: string; a?: string; x?: number };
    if (p.a !== acao || typeof p.e !== 'string' || typeof p.x !== 'number') return null;
    if (p.x < Math.floor(Date.now() / 1000)) return null;
    return p.e;
  } catch {
    return null;
  }
}
