import type { MetadataRoute } from 'next';

const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.abdomeninsano.com.br';

/** Duas rotas públicas é o mapa inteiro do funil hoje. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${base}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/obrigado`, changeFrequency: 'yearly', priority: 0.1 },
  ];
}
