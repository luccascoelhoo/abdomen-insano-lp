import type { Metadata, Viewport } from 'next';
import { Archivo, Inter_Tight, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { faq, marca, oferta } from '@/content/desafio';

/**
 * Fontes servidas pelo próprio domínio (next/font baixa e hospeda no build).
 * O arquivo antigo puxava três famílias da CDN do Google, o que bloqueava a
 * renderização e era o gargalo de LCP no 4G.
 */
const archivo = Archivo({
  subsets: ['latin'],
  weight: ['600', '700', '800', '900'],
  variable: '--font-archivo',
  display: 'swap',
});
const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter-tight',
  display: 'swap',
});
const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-jetbrains',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://desafioabdomeninsano.com.br';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: marca.titulo,
  description: marca.descricao,
  alternates: { canonical: '/' },
  icons: { icon: marca.logo },
  openGraph: {
    type: 'website',
    url: '/',
    locale: 'pt_BR',
    siteName: marca.nome,
    title: 'Desafio Abdômen Insano — 42 dias',
    description:
      '42 dias. Treino avançado, alimentação simplificada e o elemento fundamental. Você aceita o desafio?',
    images: [{ url: '/img/og-card.jpg', width: 1200, height: 630, alt: marca.nome }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Desafio Abdômen Insano — 42 dias',
    description: '42 dias para o abdômen trincado. Você aceita o desafio?',
    images: ['/img/og-card.jpg'],
  },
};

export const viewport: Viewport = {
  themeColor: '#0B0B0B',
};

/** Rich result de graça: as 12 perguntas que já existiam na página. */
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'FAQPage',
      mainEntity: faq.map((item) => ({
        '@type': 'Question',
        name: item.pergunta,
        acceptedAnswer: { '@type': 'Answer', text: item.resposta },
      })),
    },
    {
      '@type': 'Product',
      name: marca.nome,
      description: marca.descricao,
      image: `${siteUrl}${marca.logo}`,
      brand: { '@type': 'Brand', name: 'Flameer' },
      offers: {
        '@type': 'Offer',
        price: oferta.precoNumero,
        priceCurrency: oferta.precoMoeda,
        availability: 'https://schema.org/InStock',
        url: siteUrl,
      },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${archivo.variable} ${interTight.variable} ${jetbrains.variable}`}
    >
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
