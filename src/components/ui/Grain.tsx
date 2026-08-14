/**
 * Granulado fixo sobre a página inteira.
 *
 * É o detalhe que mais tira a cara de "vetor gerado": cor chapada de tela é
 * limpa demais para uma marca de academia. O ruído vem de um filtro SVG
 * embutido — nenhum arquivo de imagem, custo praticamente zero.
 */
export function Grain() {
  return (
    <div className="grain" aria-hidden="true">
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <filter id="ruido">
          <feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#ruido)" />
      </svg>
    </div>
  );
}
