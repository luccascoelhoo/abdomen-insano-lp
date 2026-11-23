/**
 * Medição do funil do quiz: um evento anônimo por tela vista. Sem e-mail, nome
 * ou resposta — só qual tela, quanto tempo na anterior e uma sessão aleatória
 * (sessionStorage). Falha em silêncio: medir nunca atrapalha o quiz.
 */
const CHAVE = 'ai_quiz_sessao';

function sessao(): string {
  try {
    let id = sessionStorage.getItem(CHAVE);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(CHAVE, id);
    }
    return id;
  } catch {
    return 'sem-sessao-' + Math.random().toString(36).slice(2, 12);
  }
}

export type EventoQuiz = {
  evento: 'view' | 'voltar';
  indice: number;
  tela: string;
  indiceAnterior?: number;
  msAnterior?: number;
  origem?: string;
};

export function enviarEventoQuiz(e: EventoQuiz): void {
  try {
    const corpo = JSON.stringify({ sessao: sessao(), ...e });
    if (navigator.sendBeacon?.('/api/quiz/evento', new Blob([corpo], { type: 'application/json' }))) return;
    void fetch('/api/quiz/evento', { method: 'POST', body: corpo, headers: { 'content-type': 'application/json' }, keepalive: true });
  } catch {}
}
