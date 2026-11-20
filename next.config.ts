import type { NextConfig } from "next";

/**
 * Subdomínio do quiz (pedido de 19/11/2026): `quiz.abdomeninsano.com.br` abre
 * o quiz na raiz, sem mudar o endereço, e o `/quiz` do site principal
 * redireciona para lá. O resto (`/_next`, `/img`, `/api/quiz`) segue igual
 * porque é o mesmo projeto, e o funil pós-compra (upsell, downsell, /obrigado)
 * continua no site principal (`origemDoFunil`, em lib/pagina-de-origem.ts).
 *
 * Para valer em produção: o domínio tem que estar no projeto da Vercel e o DNS
 * (CNAME `quiz`) apontado. ORDEM DE PUBLICAÇÃO: só mergear depois de o
 * subdomínio responder, senão o redirecionamento do `/quiz` leva o anúncio a um
 * endereço que não abre.
 */
const HOST_QUIZ = "quiz.abdomeninsano.com.br";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [{ source: "/", has: [{ type: "host", value: HOST_QUIZ }], destination: "/quiz" }],
      afterFiles: [],
      fallback: [],
    };
  },
  async redirects() {
    return [
      {
        // Só `/quiz` exato: `/quiz/email` (link de confirmação dos e-mails) fica.
        // A query (UTMs, fbclid) segue junto. Temporário (307): fácil de desfazer.
        source: "/quiz",
        has: [{ type: "host", value: "www.abdomeninsano.com.br" }],
        destination: `https://${HOST_QUIZ}/`,
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
