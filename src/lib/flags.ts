/**
 * Chaves de liga/desliga da página.
 *
 * Enquanto as imagens reais não chegam, `IMAGENS_PRONTAS` fica em `false` e a
 * página desenha espaços reservados no lugar da logo e dos 10 casos — assim dá
 * pra ver o layout completo sem arquivo quebrado na tela.
 * Basta soltar os arquivos em `public/img/` e virar a chave para `true`.
 */
export const IMAGENS_PRONTAS = process.env.NEXT_PUBLIC_IMAGENS_PRONTAS === 'true';

/** Barra fixa de compra no celular, a partir do primeiro terço da rolagem. */
export const CTA_STICKY_MOBILE = true;

/** As provocações da página rolam até a oferta em vez de serem só texto. */
export const PROVOCACOES_CLICAVEIS = true;
