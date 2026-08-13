# Desafio Abdômen Insano — página de vendas

Reescrita do `index.html` de arquivo único em **Next.js 16 + TypeScript + Tailwind v4**,
para poder ter animação de verdade, integração com gateway de pagamento e banco de dados —
coisas que um HTML estático não faz.

> Projeto **web**, separado do app iOS Flameer. Não faz parte da árvore canônica do app.

```bash
npm install
npm run dev     # http://localhost:3000
```

## Onde mexer

| O quê | Onde |
|---|---|
| **Qualquer texto da página** (FAQ, bônus, preço, semanas, depoimentos) | `src/content/desafio.ts` — e só ali |
| Identidade visual (cores, fontes, espaçamentos) | `src/app/globals.css` (`@theme` no topo) |
| Ligar/desligar CTA sticky, provocações clicáveis, imagens | `src/lib/flags.ts` |
| Uma seção específica | `src/components/sections/` |

## O que já está resolvido

- **Fontes servidas pelo próprio domínio** (`next/font`) — antes vinham da CDN do Google e
  bloqueavam a renderização.
- **A página nasce visível sem JavaScript.** Todo o estado escondido da animação vive dentro
  de `@media (scripting: enabled)`; o HTML servido não tem um único `opacity:0`. O arquivo
  antigo escondia metade do conteúdo se o script falhasse.
- **JSON-LD** de `FAQPage` e `Product`/`Offer`, Open Graph e Twitter card completos.
- **CTA sticky no celular**, aparecendo depois do primeiro terço da rolagem e sumindo quando
  o bloco de oferta entra na tela; as provocações rolam até a oferta.
- **O botão de suporte não existe enquanto não houver link** — melhor que um `href="#"`.

## O que falta (nas próximas etapas)

1. **Rastreamento**: Pixel por variável de ambiente, UTM/`fbclid` anexados ao link do
   checkout (hoje eles morrem no clique), `Purchase` e Conversions API com `event_id`.
2. **Banco e gateway**: `api/lead`, `api/webhook/[gateway]` com assinatura verificada e
   idempotência, provisionamento de acesso pelo e-mail da compra.
3. **Imagens**: soltar os arquivos em `public/img/` e virar `NEXT_PUBLIC_IMAGENS_PRONTAS`.
4. **Páginas legais**: `/privacidade`, `/termos`, `/contato` — exigidas pela LGPD assim que
   o Pixel entrar no ar.
