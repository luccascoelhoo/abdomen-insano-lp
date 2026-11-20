import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // quiz.abdomeninsano.com.br é o mesmo projeto: a raiz do subdomínio abre o quiz.
  // Só a raiz é reescrita; /quiz/email, /api e os arquivos estáticos seguem pelo caminho normal,
  // e a query (UTM, fbclid) passa adiante sem mudança.
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/",
          has: [{ type: "host", value: "quiz.abdomeninsano.com.br" }],
          destination: "/quiz",
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
