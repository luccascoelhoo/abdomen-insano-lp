# Desafio Abdômen Insano — página de vendas

Reescrita do `index.html` de arquivo único em **Next.js 16 + TypeScript + Tailwind v4**,
para poder ter animação de verdade, integração com gateway de pagamento e banco de dados —
coisas que um HTML estático não faz.

> Projeto **web**, separado do app iOS Flameer. Não faz parte da árvore canônica do app.

```bash
npm install
npm run dev     # http://localhost:3000
```

## A direção visual (para não voltar ao genérico)

*Cartaz de academia impresso, não painel de SaaS.* Cada decisão abaixo existe para
fugir da média estatística — que é exatamente o que uma página gerada por prompt
entrega: papel cinza, Inter, quatro cards iguais em grade, tudo simétrico.

| Decisão | Por quê |
|---|---|
| **Big Shoulders** no display, com eixo de tamanho óptico | Tipo de sinalização esportiva, feito para corpo grande. O eixo `opsz` muda o desenho da letra entre o cartaz e a lista — variação real, não texto esticado |
| **Hanken Grotesk** no texto | Humanista, com calor. Substitui o Inter/Inter Tight, que é a assinatura visual do texto automático |
| **Martian Mono** na camada de dado | Etiqueta, índice, legenda — só em corpo pequeno com entreletra aberta, como carimbo de ficha |
| **Papel quente** `#F1EEE7` no lugar do cinza `#F2F2F2` | Cinza neutro lê como tela; papel quente lê como impresso |
| **Granulado** por filtro SVG sobre a página | Cor chapada é limpa demais para marca de academia. Zero arquivo de imagem |
| **Nenhuma grade de cards repetida** | Método virou índice grudado + pilares empilhados; benefícios viraram duas colunas desencontradas; depoimentos viraram trilho arrastável; entregáveis viraram lista numerada grande |
| **Coisas que sangram e tortas** | Numeral fantasma saindo pela direita, malha girada com sombra dura, bônus com meio grau de rotação, assinatura do rodapé cortada pela borda |
| **Capitular na história do Igor** | Recurso de impresso que gerador nenhum coloca |

### Movimento

Rolagem suave com inércia (**Lenis**), fio de progresso no topo, título que sobe
linha a linha por trás de uma máscara, malha dos 42 dias preenchendo célula a
célula, barras das semanas crescendo linha a linha, faixa de argumentos que
acelera e inverte com a rolagem, contadores, botão com preenchimento que sobe.
Tudo desligado sob `prefers-reduced-motion`.

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
