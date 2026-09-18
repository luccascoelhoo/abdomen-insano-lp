import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { Grain } from '@/components/ui/Grain';
import { ScrollProgress } from '@/components/ui/ScrollProgress';
import { SmoothScroll } from '@/components/ui/SmoothScroll';
import { MetaPixel } from '@/components/ui/MetaPixel';
import { PIXEL_ID } from '@/lib/pixel';
import { UtmCatcher } from '@/components/ui/UtmCatcher';
import { faq, marca, oferta } from '@/content/desafio';

/**
 * SISTEMA TIPOGRÁFICO
 *
 * Space Grotesk no display: geométrica moderna, com peso medium/semibold
 * suficiente pra ancorar títulos sem pesar. Menos "muro de letras" que
 * Anton ou Big Shoulders.
 *
 * Inter carrega o texto corrido: neutro moderno, feito pra tela, com
 * excelente legibilidade em português.
 *
 * JetBrains Mono na camada de dado — corpo pequeno, letra técnica, com
 * kerning generoso.
 */
const display = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
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

// O domínio no ar é `www.abdomeninsano.com.br`. O antigo continuava como padrão,
// e com isso `canonical`, `og:url` e `og:image` apontavam para um site que não é
// este — preview quebrado no compartilhamento e canonical mentindo para o buscador.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.abdomeninsano.com.br';

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

/**
 * Snippet base do Meta Pixel, inline no `<head>`.
 *
 * Só carrega a biblioteca e chama `init`. O `PageView` sai do componente
 * `MetaPixel`, pelo helper que carimba `event_id` — o snippet oficial junta os
 * dois na mesma linha e, com isso, o primeiro evento da página seria o único
 * sem id.
 */
const pixelBase = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${PIXEL_ID}');`;

/**
 * Container do Google Tag Manager.
 *
 * Entra só agora porque, até a versão publicada em 18/09/2026, o container
 * carregava seis tags do Facebook apontando para o pixel de outro produto —
 * subir o snippet antes disso faria a página disparar Page View duas vezes,
 * uma pelo código e outra pelo container, e cada visita valeria por duas.
 * Na versão no ar aquelas seis tags estão pausadas e só o GA4 dispara, então
 * o container e o pixel do código não se atropelam.
 */
const GTM_ID = 'GTM-KV4MKTXG';

const gtmBase = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${corpo.variable} ${dado.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: pixelBase }} />
        <script dangerouslySetInnerHTML={{ __html: gtmBase }} />
      </head>
      <body>
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
            title="Google Tag Manager"
          />
        </noscript>
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            alt=""
            src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          />
        </noscript>
        <MetaPixel />
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
