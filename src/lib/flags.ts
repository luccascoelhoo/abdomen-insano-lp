/**
 * Chaves de liga/desliga da página.
 *
 * Enquanto as imagens reais não chegam, `IMAGENS_PRONTAS` fica em `false` e a
 * página desenha espaços reservados no lugar da logo e dos 10 casos — assim dá
 * pra ver o layout completo sem arquivo quebrado na tela.
 * Basta soltar os arquivos em `public/img/` e virar a chave para `true`.
 */
export const IMAGENS_PRONTAS = true;

/**
 * As provocações da página (hoje só o "Aceita o desafio?" do topo) rolam até a
 * oferta em vez de serem só texto. Desligado em 24/10/2026: o link levava direto
 * ao preço, antes de a pessoa ter lido a página.
 */
export const PROVOCACOES_CLICAVEIS = false;
