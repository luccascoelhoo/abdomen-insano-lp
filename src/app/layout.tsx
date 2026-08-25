import type { Metadata, Viewport } from 'next';
import { Anton, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Grain } from '@/components/ui/Grain';
import { ScrollProgress } from '@/components/ui/ScrollProgress';
import { SmoothScroll } from '@/components/ui/SmoothScroll';
import { UtmCatcher } from '@/components/ui/UtmCatcher';
import { faq, marca, oferta } from '@/content/desafio';

/**
 * SISTEMA TIPOGRÁFICO
 *
 * Anton no display: geometria condensada e bold sem os "espinhos" ópticos de
 * Big Shoulders — mesmo peso visual, menos agressivo em corpo grande.
 *
 * Inter carrega o texto corrido: neutro moderno, feito pra tela, com
 * excelente legibilidade em português. Também sustenta headline em bold.
 *
 * JetBrains Mono na camada de dado — corpo pequeno, letra técnica, mas com
 * kerning mais generoso que Martian Mono (menos "cristal" nos cantos).
 */
const display = Anton({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display-src',
  display: 'swap',
});
const corpo = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-body-src',
  display: 'swap',
});
const dado = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-mono-src',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://desafioabdomeninsano.com.br';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: marca.titulo,
  description: marca.descricao,
  alternates: { canonical: '/' },
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
  themeColor: '#0C0B0A',
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
    <html lang="pt-BR" className={`${display.variable} ${corpo.variable} ${dado.variable}`}>
      <body>
        <UtmCatcher />
        <SmoothScroll />
        <ScrollProgress />
        <Grain />
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
