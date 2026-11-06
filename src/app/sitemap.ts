import type { MetadataRoute } from 'next';

const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.abdomeninsano.com.br';

/**
 * Só a página de vendas entra: as demais (`/obrigado`, o funil, `/antiga`,
 * `/v3`) são `noindex`, e listar no mapa uma página que o próprio site manda o
 * Google ignorar é um sinal contraditório (corrigido em 06/11/2026).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${base}/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 }];
}
