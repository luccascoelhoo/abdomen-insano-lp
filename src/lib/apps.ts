/**
 * Links dos aplicativos móveis, entregues depois do cadastro concluído.
 * Se as URLs ainda não existem, mantenha strings vazias — a página /obrigado
 * mostra o estado "em breve" no lugar dos botões, sem link quebrado.
 */
export const linksApp = {
  appStore: process.env.NEXT_PUBLIC_APP_STORE_URL ?? '',
  playStore: process.env.NEXT_PUBLIC_PLAY_STORE_URL ?? '',
} as const;

export function appsPublicados(): boolean {
  return Boolean(linksApp.appStore || linksApp.playStore);
}
