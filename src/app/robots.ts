import type { MetadataRoute } from 'next';

/** Sem isto o `/robots.txt` devolve 404, e o rastreador trata como erro do site. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.abdomeninsano.com.br'}/sitemap.xml`,
  };
}
