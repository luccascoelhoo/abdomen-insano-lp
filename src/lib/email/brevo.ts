/**
 * Envio de e-mail pela API transacional da Brevo (a mesma conta do app).
 *
 * Remetente: um endereço de `gruposhapeinsano.com.br`, domínio já autenticado
 * na Brevo (DKIM, SPF e brevo-code na zona; ver Flammer/DNS_E_EMAIL.md). NÃO
 * usar `abdomeninsano.com.br`: ele tem SPF `-all` e DMARC `reject` de
 * propósito, e o e-mail seria recusado.
 *
 * Env: BREVO_API_KEY (obrigatória), EMAIL_REMETENTE, EMAIL_REMETENTE_NOME,
 * EMAIL_RESPONDER_PARA. Sem a chave, nada sai e a função avisa.
 */

export interface EmailSaida {
  para: string;
  nome?: string;
  assunto: string;
  html: string;
  texto: string;
  /** Etiquetas para achar o envio no painel da Brevo. */
  tags?: string[];
  /** Cabeçalho List-Unsubscribe (link de descadastro), para e-mails de marketing. */
  descadastro?: string;
}

export type ResultadoEmail = { ok: true; id?: string } | { ok: false; motivo: string };

export function emailConfigurado(): boolean {
  return Boolean(process.env.BREVO_API_KEY);
}

export async function enviarEmail(e: EmailSaida): Promise<ResultadoEmail> {
  const chave = process.env.BREVO_API_KEY;
  if (!chave) return { ok: false, motivo: 'sem_chave' };
  const corpo = {
    sender: {
      email: process.env.EMAIL_REMETENTE ?? 'desafio@gruposhapeinsano.com.br',
      name: process.env.EMAIL_REMETENTE_NOME ?? 'Igor | Desafio Abdômen Insano',
    },
    replyTo: { email: process.env.EMAIL_RESPONDER_PARA ?? 'contatoshapeinsano@gmail.com' },
    to: [{ email: e.para, ...(e.nome ? { name: e.nome } : {}) }],
    subject: e.assunto,
    htmlContent: e.html,
    textContent: e.texto,
    ...(e.tags?.length ? { tags: e.tags } : {}),
    ...(e.descadastro
      ? { headers: { 'List-Unsubscribe': `<${e.descadastro}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' } }
      : {}),
  };
  try {
    const r = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': chave, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify(corpo),
      signal: AbortSignal.timeout(10_000),
    });
    if (!r.ok) {
      // Sem o e-mail no log: o código basta para achar o problema.
      const detalhe = (await r.text().catch(() => '')).slice(0, 200);
      return { ok: false, motivo: `http_${r.status}:${detalhe}` };
    }
    const j = (await r.json().catch(() => ({}))) as { messageId?: string };
    return { ok: true, id: j.messageId };
  } catch (err) {
    return { ok: false, motivo: err instanceof Error ? err.name : 'erro' };
  }
}
