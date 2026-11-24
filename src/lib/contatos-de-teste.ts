import { normalizarEmail } from '@/lib/compra';

/**
 * E-mails do time que conferem o quiz em produção. Cadastro deles fica marcado
 * `teste` e sai dos números do painel, com a jornada inteira.
 *
 * A lista vive na variável `QUIZ_EMAILS_TESTE` (separada por vírgula), e não
 * no código: é dado pessoal, e mudar quem testa não pede deploy de código.
 * Quem testa sem estar na lista usa `?teste=1` na URL do quiz.
 */
export function ehContatoDeTeste(email: string): boolean {
  const lista = process.env.QUIZ_EMAILS_TESTE;
  if (!lista) return false;
  const alvo = normalizarEmail(email);
  return lista
    .split(',')
    .map((e) => normalizarEmail(e))
    .some((e) => e !== '' && e === alvo);
}
