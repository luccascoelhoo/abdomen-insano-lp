import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { Grain } from '@/components/ui/Grain';
import { SmoothScroll } from '@/components/ui/SmoothScroll';
import { MetaPixel } from '@/components/ui/MetaPixel';
import { PIXEL_ID } from '@/lib/pixel';
import { UtmCatcher } from '@/components/ui/UtmCatcher';
import { PrecosProvider } from '@/components/ui/Precos';
import { precosAtuais, recorrenciasAtuais } from '@/lib/precos';
import { marca, oferta } from '@/content/desafio';
import { faqV2 } from '@/content/lp-v2';

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
/*
 * As três famílias são variáveis e ficam no próprio projeto (`./fonts`, só o
 * subconjunto latino, que cobre o português). Antes vinham do Google Fonts no
 * build, e o deploy da Vercel falhou três vezes em 06/11/2026 por não
 * conseguir baixá-las; hospedadas aqui, o build não depende de rede externa.
 * Um arquivo por família serve todos os pesos usados.
 */
const display = localFont({
  src: './fonts/space-grotesk-latin.woff2',
  weight: '300 700',
  variable: '--font-display-src',
  display: 'swap',
});
const corpo = localFont({
  src: './fonts/inter-latin.woff2',
  weight: '100 900',
  variable: '--font-body-src',
  display: 'swap',
});
const dado = localFont({
  src: './fonts/jetbrains-mono-latin.woff2',
  weight: '100 800',
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
  // Verificação de propriedade no Google Search Console (06/11/2026).
  verification: { google: 'YO9NsT8Uj4A6f6IT92JWa55vkslfD4Zs433N-jkzJIA' },
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

/** Rich result de graça: as perguntas da página oficial (V.2). */
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'FAQPage',
      mainEntity: faqV2.itens.map((item) => ({
        '@type': 'Question',
        name: item.pergunta,
        acceptedAnswer: { '@type': 'Answer', text: item.resposta },
      })),
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#site`,
      url: siteUrl,
      name: marca.nome,
      inLanguage: 'pt-BR',
      publisher: { '@id': `${siteUrl}/#org` },
    },
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#org`,
      name: marca.nome,
      legalName: 'SI TREINAMENTOS LTDA',
      url: siteUrl,
      logo: `${siteUrl}${marca.logo}`,
      email: 'contatoshapeinsano@gmail.com',
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
        hasMerchantReturnPolicy: {
          '@type': 'MerchantReturnPolicy',
          applicableCountry: 'BR',
          returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
          merchantReturnDays: 15,
          returnMethod: 'https://schema.org/ReturnByMail',
          returnFees: 'https://schema.org/FreeReturn',
        },
        // Produto digital: sem frete e acesso imediato.
        shippingDetails: {
          '@type': 'OfferShippingDetails',
          shippingRate: { '@type': 'MonetaryAmount', value: 0, currency: oferta.precoMoeda },
          shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'BR' },
          deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 0, unitCode: 'DAY' },
            transitTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 0, unitCode: 'DAY' },
          },
        },
      },
    },
  ],
};

/**
 * Snippet base do Meta Pixel, inline no `<head>`.
 *
 * Só prepara a fila (`fbq`), cria os cookies e chama `init`. O `PageView` sai do
 * componente `MetaPixel`, pelo helper que carimba `event_id` — o snippet oficial
 * junta os dois na mesma linha e, com isso, o primeiro evento da página seria o
 * único sem id.
 *
 * A BIBLIOTECA (`fbevents.js`, ~270 KB e ~1 s de processamento no celular) só é
 * baixada na primeira interação (rolar, tocar, tecla) ou 4 s depois de a página
 * carregar, o que vier primeiro (pedido do Igor em 06/11/2026). Nada se perde:
 *  - todo `fbq(...)` chamado antes vai para a fila e sai quando a biblioteca
 *    chega, com o mesmo `event_id` (a cópia do servidor continua deduplicando);
 *  - os cookies `_fbp` e `_fbc` são criados AQUI, no mesmo formato do Meta, para
 *    existirem desde o primeiro instante: o botão de compra e a cópia do
 *    servidor leem esses cookies, e sem eles um clique rápido sairia sem a
 *    origem do anúncio. Quando a biblioteca chega, ela reaproveita os cookies.
 * O que muda: quem fecha a página antes de rolar/tocar e antes de 4 s deixa de
 * ser contado no `PageView` do navegador.
 */
const pixelBase = `(function(w,d){
function ck(n){var m=d.cookie.match('(?:^|; )'+n+'=([^;]*)');return m?m[1]:null}
function dom(){var h=d.location.hostname.split('.');if(h.length<2||/^[0-9.]+$/.test(d.location.hostname))return null;
for(var i=2;i<=h.length;i++){var x=h.slice(-i).join('.');d.cookie='_fbck=1;domain=.'+x+';path=/;max-age=10';
if(ck('_fbck')){d.cookie='_fbck=;domain=.'+x+';path=/;max-age=0';return{d:x,i:i-1}}}return null}
try{var D=dom();if(D){var t=Date.now(),mx=';domain=.'+D.d+';path=/;max-age=7776000;SameSite=Lax';
if(!ck('_fbp'))d.cookie='_fbp=fb.'+D.i+'.'+t+'.'+Math.round(2147483647*Math.random())+mx;
var q=d.location.search.match(/[?&]fbclid=([^&#]+)/);
if(q&&!ck('_fbc'))d.cookie='_fbc=fb.'+D.i+'.'+t+'.'+q[1]+mx}}catch(e){}
if(!w.fbq){var n=w.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!w._fbq)w._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[]}
var on=false;function go(){if(on)return;on=true;var s=d.createElement('script');s.async=true;
s.src='https://connect.facebook.net/en_US/fbevents.js';d.head.appendChild(s)}
['scroll','pointerdown','keydown','touchstart'].forEach(function(e){w.addEventListener(e,go,{once:true,passive:true})});
function late(){setTimeout(go,4000)}
d.readyState==='complete'?late():w.addEventListener('load',late);
fbq('init','${PIXEL_ID}');
})(window,document);`;

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

/*
 * O container só sobe depois da primeira interação (rolar, tocar, clicar) ou
 * 4 s depois de a página carregar, o que vier primeiro. Ele só dispara o GA4 e
 * pesa ~310 KB e ~0,8 s de processamento no celular, que antes competiam com a
 * primeira tela. O `dataLayer` e o `gtm.start` são criados já, então nenhum
 * evento se perde: o que for empurrado antes é processado quando o container
 * chega. O Meta Pixel NÃO foi adiado.
 */
const gtmBase = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var go=false;function load(){if(go)return;go=true;
var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);}
['scroll','pointerdown','keydown','touchstart'].forEach(function(e){w.addEventListener(e,load,{once:true,passive:true});});
function late(){setTimeout(load,4000);}
d.readyState==='complete'?late():w.addEventListener('load',late);
})(window,document,'script','dataLayer','${GTM_ID}');`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Preço vivo da Cakto para os eventos do pixel (ver lib/precos).
  const [precos, recorrencias] = await Promise.all([precosAtuais(), recorrenciasAtuais()]);
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
        <Grain />
        <PrecosProvider precos={precos} recorrencias={recorrencias}>
          {children}
        </PrecosProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
