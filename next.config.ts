import type { NextConfig } from "next";

/**
 * Subdomínio do quiz (pedido de 19/11/2026): `quiz.abdomeninsano.com.br` abre
 * o quiz na raiz, sem mudar o endereço. O resto (`/_next`, `/img`, `/api/quiz`)
 * segue igual porque é o mesmo projeto. Para valer em produção, alguém com
 * acesso precisa adicionar o domínio no projeto da Vercel e apontar o DNS
 * (CNAME `quiz` → `cname.vercel-dns.com`); sem isso esta regra não faz nada.
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
};

export default nextConfig;
