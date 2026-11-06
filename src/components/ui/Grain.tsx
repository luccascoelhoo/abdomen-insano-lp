/**
 * Granulado fixo sobre a página inteira.
 *
 * É o detalhe que mais tira a cara de "vetor gerado": cor chapada de tela é
 * limpa demais para uma marca de academia. O ruído é um ladrilho PNG de 128 px
 * (`/img/granulado.png`) repetido — antes era um filtro SVG (feTurbulence) em
 * tela cheia, que o navegador recalculava na rolagem (medido em 06/11/2026:
 * ~1,2 s de processamento no carregamento, no celular).
 */
export function Grain() {
  return <div className="grain" aria-hidden="true" />;
}
