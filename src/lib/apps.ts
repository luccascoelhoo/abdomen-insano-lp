/**
 * Links dos aplicativos móveis, entregues depois do cadastro concluído.
 * Se as URLs ainda não existem, mantenha strings vazias — a página /obrigado
 * mostra o estado "em breve" no lugar dos botões, sem link quebrado.
 */
export const linksApp = {
  // A App Store publicou a 1.0 em 23/09/2026 (id6788119109). Até 07/10 a
  // variável estava vazia na Vercel e /obrigado mostrava `href="#"` para quem
  // acabou de pagar. `||` (e não `??`) porque a variável vazia chega como ''.
  appStore: process.env.NEXT_PUBLIC_APP_STORE_URL || 'https://apps.apple.com/br/app/flameer/id6788119109',
  // Google Play publicado (br.com.flameerapp, SI Treinamentos). Sem esta URL
  // os botões voltam ao estado "em análise" — não ao `href="#"`.
  playStore:
    process.env.NEXT_PUBLIC_PLAY_STORE_URL ||
    'https://play.google.com/store/apps/details?id=br.com.flameerapp',
} as const;

export function appsPublicados(): boolean {
  return Boolean(linksApp.appStore || linksApp.playStore);
}
