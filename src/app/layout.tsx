import type { Metadata, Viewport } from 'next';
import { Big_Shoulders, Hanken_Grotesk, Martian_Mono } from 'next/font/google';
import './globals.css';
import { Grain } from '@/components/ui/Grain';
import { ScrollProgress } from '@/components/ui/ScrollProgress';
import { SmoothScroll } from '@/components/ui/SmoothScroll';
import { faq, marca, oferta } from '@/content/desafio';

/**
 * SISTEMA TIPOGRÁFICO
 *
 * Big Shoulders é tipo de sinalização esportiva — condensada, feita para ser
 * lida de longe e em corpo grande. É o oposto do grotesco neutro que toda
 * página gerada por IA usa. O eixo de largura é o que dá variação de verdade:
 * ultracondensado nos números gigantes, mais aberto nos títulos de seção.
 *
 * Hanken Grotesk carrega o texto corrido: humanista, com bem mais calor que
 * Inter, e aguenta parágrafo longo em português sem cansar.
 *
 * Martian Mono é a camada de dado — etiqueta, número de seção, legenda.
 * Só aparece em corpo pequeno com entreletra aberta, como carimbo de ficha.
 */
const display = Big_Shoulders({
  subsets: ['latin'],
  // Sem `weight` e com o eixo declarado, o next/font entrega o arquivo
  // VARIÁVEL. `opsz` é tamanho óptico: o desenho da letra muda entre o corpo
  // de cartaz e o corpo de lista — a mesma família com dois comportamentos,
  // que é a variação que faz a página parecer composta por alguém.
  axes: ['opsz'],
  variable: '--font-display-src',
  display: 'swap',
});
const corpo = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-body-src',
  display: 'swap',
});
const dado = Martian_Mono({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-mono-src',
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
