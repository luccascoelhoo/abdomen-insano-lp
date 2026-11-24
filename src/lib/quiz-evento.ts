/**
 * Medição do funil do quiz: um evento anônimo por tela vista. Sem e-mail, nome
 * ou resposta — só qual tela, quanto tempo na anterior e uma sessão aleatória
 * (sessionStorage). Falha em silêncio: medir nunca atrapalha o quiz.
 *
 * A mesma sessão viaja no envio do e-mail (`/api/quiz`), e é ela que liga o
 * lead à jornada dele no painel: quais telas viu e se clicou em comprar.
 */
const CHAVE = 'ai_quiz_sessao';
const CHAVE_TESTE = 'ai_quiz_teste';

/** Sem sessionStorage (aba privada antiga, bloqueio), a sessão vive na memória da página. */
let sessaoSemArmazenamento: string | null = null;

export function sessaoDoQuiz(): string {
  try {
    let id = sessionStorage.getItem(CHAVE);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(CHAVE, id);
    }
    return id;
  } catch {
    // Uma só por página: gerar outra a cada chamada fazia de cada tela uma
    // "pessoa" nova no funil, e o lead nunca encontrava a própria jornada.
    sessaoSemArmazenamento ??= 'sem-sessao-' + Math.random().toString(36).slice(2, 12);
    return sessaoSemArmazenamento;
  }
}

/**
 * Jornada de teste: quem abre com `?teste=1` fica marcado até fechar a aba, e
 * o painel tira essa jornada inteira dos números. Sem isto, cada conferência
 * do time vira "lead" e "abandono" na tela do cliente.
 */
export function jornadaDeTeste(): boolean {
  try {
    if (new URLSearchParams(window.location.search).get('teste') === '1') sessionStorage.setItem(CHAVE_TESTE, '1');
    return sessionStorage.getItem(CHAVE_TESTE) === '1';
  } catch {
    return false;
  }
}

export type EventoQuiz = {
  /** `checkout` = clicou num botão de compra da oferta do quiz. */
  evento: 'view' | 'voltar' | 'checkout';
  indice: number;
  tela: string;
  indiceAnterior?: number;
  msAnterior?: number;
  origem?: string;
};

export function enviarEventoQuiz(e: EventoQuiz): void {
  try {
    const corpo = JSON.stringify({ sessao: sessaoDoQuiz(), teste: jornadaDeTeste(), ...e });
    if (navigator.sendBeacon?.('/api/quiz/evento', new Blob([corpo], { type: 'application/json' }))) return;
    void fetch('/api/quiz/evento', { method: 'POST', body: corpo, headers: { 'content-type': 'application/json' }, keepalive: true });
  } catch {}
}
