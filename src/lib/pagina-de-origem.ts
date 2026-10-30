/**
 * De qual página de vendas a compra partiu.
 *
 * Existe porque o site tem mais de uma página de entrada (a home e a /v3, e a
 * /antiga guardada) e, sem isto, toda venda chegava ao Meta e ao banco como
 * vinda da home: o webhook da Cakto não sabe de onde a pessoa clicou.
 *
 * O caminho de volta é o `sck`, o único campo livre que a Cakto repassa
 * intacto no aviso de venda, junto dos UTMs. O botão de compra escreve nele
 * `<página>__<origem do botão>`, e o webhook lê a página de volta:
 *
 *   /v3, botão do topo   → sck "v3__v3-hero"   → https://…/v3
 *   /,   card da oferta  → sck "home__v2-oferta" → https://…/
 *
 * Só letras minúsculas, números e hífen: o `sck` viaja em URL e em payload de
 * terceiro, e um caractere estranho é o tipo de coisa que some no caminho.
 */

const SEPARADOR = '__';
const SLUG_HOME = 'home';
const SLUG_VALIDO = /^[a-z0-9-]{1,40}$/;
/**
 * As páginas de vendas que existem. Só elas viram URL na volta: um `sck` de
 * terceiro com "__" não inventa página. Página nova com botão de compra entra
 * aqui, senão as vendas dela são contadas como da home.
 */
const PAGINAS = new Set([SLUG_HOME, 'v3', 'antiga']);

/** `/` → "home", `/v3` → "v3", `/v3/` → "v3". Fora do padrão vira "home". */
function slugDoCaminho(caminho: string): string {
  const slug = caminho.replace(/^\/+|\/+$/g, '').toLowerCase();
  return slug && SLUG_VALIDO.test(slug) ? slug : SLUG_HOME;
}

/** O `sck` que o botão de compra manda ao checkout. */
export function sckDaCompra(caminho: string, origem: string): string {
  const botao = origem.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 40);
  return `${slugDoCaminho(caminho)}${SEPARADOR}${botao}`;
}

/**
 * A URL da página de onde a venda partiu, lida do `sck` que a Cakto devolveu.
 * `null` quando o `sck` não veio ou não é nosso (aí quem chama usa a home).
 */
export function urlDaPaginaDoSck(sck: string | null | undefined, base: string): string | null {
  if (!sck) return null;
  const slug = sck.split(SEPARADOR)[0];
  if (!sck.includes(SEPARADOR) || !PAGINAS.has(slug)) return null;
  const raiz = base.replace(/\/+$/, '');
  return slug === SLUG_HOME ? `${raiz}/` : `${raiz}/${slug}`;
}
