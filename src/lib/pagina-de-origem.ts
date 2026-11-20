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
const PAGINAS = new Set([SLUG_HOME, 'v3', 'antiga', 'quiz']);

/** `/` → "home", `/v3` → "v3", `/v3/` → "v3". Fora do padrão vira "home". */
function slugDoCaminho(caminho: string): string {
  const slug = caminho.replace(/^\/+|\/+$/g, '').toLowerCase();
  return slug && SLUG_VALIDO.test(slug) ? slug : SLUG_HOME;
}

/**
 * O caminho que vale para a medição, a partir do endereço do navegador. No
 * subdomínio do quiz (`quiz.abdomeninsano.com.br`, ver `next.config.ts`) o
 * quiz abre na raiz, então o `pathname` é "/"; sem esta troca a venda e os
 * eventos do quiz seriam contados como da home.
 */
export function caminhoDaPagina(host: string, caminho: string): string {
  return host.toLowerCase().startsWith('quiz.') && (caminho === '/' || caminho === '') ? '/quiz' : caminho;
}

/**
 * Onde o pós-compra (upsell, downsell, /obrigado) acontece. O quiz vive em
 * `quiz.abdomeninsano.com.br`, mas o funil pós-compra é o do site principal:
 * é onde o botão de um clique da Cakto e os players foram validados, e é o
 * endereço configurado como página de agradecimento na Cakto. Qualquer outro
 * endereço fica como está.
 */
export function origemDoFunil(origem: string): string {
  return origem.replace('//quiz.', '//www.');
}

/**
 * A base da URL de origem de um evento do servidor: a página de onde ele
 * realmente veio (o `Origin` da requisição), se for deste site, para a segunda
 * perna (API de Conversões) bater com a do navegador. Senão, o padrão.
 */
export function baseDaOrigem(origem: string | null | undefined, padrao: string): string {
  try {
    if (!origem) return padrao;
    const u = new URL(origem);
    const doSite = u.host === 'abdomeninsano.com.br' || u.host.endsWith('.abdomeninsano.com.br');
    return doSite && u.protocol === 'https:' ? u.origin : padrao;
  } catch {
    return padrao;
  }
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
