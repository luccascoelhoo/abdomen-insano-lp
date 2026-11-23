import type { NextConfig } from "next";

// quiz.abdomeninsano.com.br é o mesmo projeto: a raiz do subdomínio abre o quiz.
// Só a raiz é reescrita; /quiz/email, /api e os arquivos estáticos seguem pelo caminho normal,
// e a query (UTM, fbclid) passa adiante sem mudança.
const HOST_DO_QUIZ = "quiz.abdomeninsano.com.br";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/",
          has: [{ type: "host", value: HOST_DO_QUIZ }],
          destination: "/quiz",
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  // O subdomínio não entra no Google: a página de vendas (www) é a que ranqueia,
  // e o mesmo site respondendo nos dois endereços viraria conteúdo duplicado.
  async headers() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: HOST_DO_QUIZ }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
