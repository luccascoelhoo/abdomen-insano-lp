# Guia para quem vai mexer no projeto

Estado em **21/10/2026**. Leia de cima para baixo antes de abrir qualquer arquivo.
Complementos: [`INTEGRACAO.md`](INTEGRACAO.md) (Cakto, Supabase, roteiro de teste) e
[`PENDENCIAS.md`](PENDENCIAS.md) (pendências gerais da LP).

---

## 1. O repositório certo

| O quê | Onde |
|---|---|
| **Código de produção (este repo)** | `github.com/luccascoelhoo/abdomen-insano-lp`, branch `main` |
| Site no ar | `https://www.abdomeninsano.com.br` (o domínio sem `www` redireciona para ele) |
| Projeto na Vercel | `abdomen-insano-lp`, no time `italogusta242-makers-projects` |

> ⚠️ **Existe uma cópia velha e desligada:** `github.com/italogusta242-maker/abdomen-insano-vercel`.
> Não está ligada à Vercel e não tem o rastreamento (Pixel, GTM, Conversions API). Um push
> nela **não muda o site**. Já causou confusão uma vez: não trabalhe nela.
> O repo `abdomen-insano-lp-contexto` guarda notas antigas (de setembro) — estão desatualizadas.

## 2. Como o deploy funciona

- **Merge/push na `main` = produção.** A Vercel publica sozinha.
- Todo PR gera um deploy de teste na Vercel (o check "Vercel" no PR).
- A equipe trabalha por **PR**, não por push direto na `main`. Antes de começar: `git pull` e
  `gh pr list --repo luccascoelhoo/abdomen-insano-lp` — outras pessoas mexem aqui.
- Mensagens de commit em português, no padrão `feat(...)`, `fix(...)`, `docs(...)`.

## 3. Acessos que você vai precisar pedir

Nada disso se resolve por código:

- **GitHub:** o convite vem do dono do repo (`luccascoelhoo`). Quem pediu este guia tem permissão
  de escrita, mas não de administrador, então não consegue convidar ninguém.
- **Vercel:** projeto `abdomen-insano-lp` (variáveis de ambiente, deploys, logs).
- **Cakto:** produtos, páginas de agradecimento, aviso de venda (webhook).
- **Supabase:** tabelas `compras` e `usuarios`.
- **Meta:** Gerenciador de Eventos e o pixel `894388872511780`. **O pixel é compartilhado** com
  outro funil do mesmo dono (`operacao3em10.com.br`): a otimização das campanhas daqui deve usar
  conversão personalizada filtrada por `abdomeninsano.com.br` (detalhes no topo de `src/lib/pixel.ts`).
- **GTM** `GTM-KV4MKTXG`, **VTurb** (vídeos) e **Frota Metrics** (painel da agência).

## 3.1. Regras de convivência (aprendidas da forma difícil)

1. **Nunca teste com token real do upsell.** O botão de um clique da Cakto cobra no cartão na hora,
   sem confirmação. Teste com token falso ou com compra de teste combinada.
2. **O ambiente local suja os dados reais** (ver seção 4). Desligue Pixel e GTM nos testes.
3. **Não mexa na ordem do funil sem ler a seção 6.** O downsell só pode ser alcançado a partir
   do upsell (já houve um erro de lógica que mandava todo comprador novo direto pro downsell).
4. **Nunca coloque segredo no repositório.** Valores ficam na Vercel; este repo só conhece os nomes.

## 4. Rodar localmente

```bash
npm ci
npm run dev        # http://localhost:3000
npm run build      # build de produção
npm run lint
```

- Node 24 foi o usado até aqui (o `package.json` não fixa a versão).
- **Next.js 16 / React 19:** a API mudou em relação ao que você conhece. O `AGENTS.md` pede para
  ler `node_modules/next/dist/docs/` antes de escrever código — vale a pena.
- Sem as chaves do Supabase a página abre, mas o backend (webhook, cadastro, verificar compra) não grava.
- **⚠️ Dados reais:** o `src/app/layout.tsx` carrega o **Pixel real** e o **GTM real**
  (`GTM-KV4MKTXG`, fixo no código). Rodar local dispara `PageView`/`InitiateCheckout` para o pixel de
  produção. Para testar sem sujar: rode com `NEXT_PUBLIC_META_PIXEL_ID=0000000000` e comente, **sem
  commitar**, os dois `<script>` (`pixelBase` e `gtmBase`) do `<head>`.
- **Lint:** 1 erro e 2 avisos **já existiam antes** e não impedem o build:
  `CtaButton.tsx:58` (`react-hooks/set-state-in-effect`), `Hero.tsx:24` (`<img>`),
  `DepoimentosPin.tsx:75` (variável sem uso).
- **README.md:** a tabela de "direção visual" menciona fontes que não são mais as do layout
  (hoje: Space Grotesk, Inter e JetBrains Mono). Vale como história, não como especificação.

## 5. Variáveis de ambiente

Só os **nomes** — os valores estão na Vercel. Segredos marcados com 🔒.

| Variável | Para quê | Se faltar |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Domínio canônico, sitemap, cartões de compartilhamento | Usa `https://www.abdomeninsano.com.br` |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Banco (compras e usuários) | Backend não grava |
| `SUPABASE_SERVICE_ROLE_KEY` 🔒 | Escrita no banco pelo servidor | Backend não grava |
| `CAKTO_WEBHOOK_SECRET` 🔒 | Senha do aviso de venda. A Cakto manda o segredo **no corpo** do aviso | O aviso é recusado (401) |
| `META_CAPI_TOKEN` 🔒 | Conversions API (o `Purchase` do servidor) | Sem a segunda perna do Meta |
| `META_TEST_EVENT_CODE` | Opcional. Marca os eventos como de teste no Meta | Eventos normais. **Só usar em teste e remover depois** |
| `NEXT_PUBLIC_META_PIXEL_ID` | Id do pixel | Usa o id real compartilhado (`894388872511780`) |
| `FROTA_METRICS_SALE_URL`, `FROTA_METRICS_CLIENT_ID`, `FROTA_METRICS_SALE_TOKEN` 🔒 | Cópia da venda aprovada para o painel da agência | Sem os três, o repasse é pulado (`nao_configurado`) |
| `NEXT_PUBLIC_WHATSAPP_URL` | Botão de suporte | Cai em `https://flameer.vercel.app/suporte` |
| `NEXT_PUBLIC_APP_STORE_URL`, `NEXT_PUBLIC_PLAY_STORE_URL` | Links dos apps | Usam os links reais que estão no código (`src/lib/apps.ts`) |

`VERCEL_*` são da própria Vercel. Variável vazia na Vercel chega como `''`, não `undefined` — por isso
o código usa `||` e não `??` nos padrões.

## 6. Como o funil funciona

```
Desafio (checkout Cakto) ──▶ /shapeinsano-up ── "sim" ──▶ /obrigado
                                   │
                                   └ "não" ──▶ /shapeinsano-down ── "sim" ──▶ /obrigado
                                                       │
                                                       └ "não" ──▶ /obrigado
```

| O quê | Onde |
|---|---|
| Copy, vídeos, textos dos botões, ids das ofertas | `src/content/desafio.ts` (`upsell`, `downsell`) |
| **Ordem do funil e quando uma página está "pronta"** | `src/lib/funil.ts` |
| Layout das páginas, player VTurb, botões | `src/components/funil/` e `src/app/shapeinsano-up`, `shapeinsano-down` |
| Catálogo de produtos, classificação de venda por oferta e valor | `src/lib/produtos.ts` |
| Preço lido da Cakto (cache de 5 min, com preço de reserva) | `src/lib/precos.ts` |
| Pixel, `event_id`, segunda perna pelo servidor | `src/lib/pixel.ts`, `src/app/api/evento` |
| Aviso de venda da Cakto → banco, Meta, painel da agência | `src/app/api/webhook/cakto` |
| `Purchase` do navegador, sem contar duas vezes | `src/components/ui/PurchaseTracker.tsx` |

**Regras que o código garante:**

- Uma página só entra no caminho quando está **pronta**: tem vídeo (id e script da VTurb) **e** link
  de checkout. Senão o funil a **pula** — melhor ir direto pro `/obrigado` do que mostrar vídeo vazio
  a quem acabou de pagar. Hoje **nenhuma está pronta em produção**, então o funil está **desligado**.
- **O downsell não é porta de entrada.** Quem compra o Desafio só vai ao upsell; o downsell é a
  segunda chance de quem recusou. Sem upsell pronto, o comprador vai ao `/obrigado`.
- `delaySegundos` (por vídeo): quando a VTurb libera os botões. `0` = aparecem junto com a página.
- Quem recusa o downsell vai ao `/obrigado` porque já comprou o Desafio e precisa criar a conta.
- A query (e-mail, transação, UTM, cookies do pixel) acompanha a pessoa de página em página.

### Botão de um clique da Cakto (PR #10)

Os "sim"/"não" são os elementos do script `upsell.js` da Cakto. Pelo código do script:

- **No cartão, o "sim" cobra na hora**, sem confirmação, e ~5 s depois leva ao `/obrigado`. No PIX,
  abre um modal com QR code.
- **Qualquer falha manda a pessoa para o endereço do "não"** (oferta que não carrega, cartão recusado,
  token inválido).
- O token (`upsellToken`) chega na URL pela Cakto e o "não" o leva ao downsell.
- O redirecionamento da Cakto só acrescenta o token; por isso o site monta os endereços de aceite e
  recusa já com e-mail, transação e UTM.
- Se o script não carrega, a página mostra o link de checkout comum (`aceitar.url`).
- O `InitiateCheckout` do degrau certo sai no clique do "sim".

## 7. Estado em 21/10/2026

**Já no ar (PRs #1 a #8 mergeados):** páginas de upsell e downsell, rastreamento por degrau (front,
upsell, downsell), clique de compra medido antes de a página sair (#6), links de rodapé/suporte/Google
Play (#7), preço lido da Cakto e produto reconhecido pela oferta (#8).

**Abertos, nesta ordem de merge:**

1. **PR #9** — vídeo do downsell preenchido (player VTurb `6ad909948b6fe1ef3d42e9dd`) + correção da
   lógica que fazia o downsell virar porta de entrada. Inofensivo: só muda o que aparece em
   `/shapeinsano-down`.
2. **PR #10** (empilhado sobre o #9) — botão de um clique da Cakto. **Não mergear antes de confirmar
   o `offer-type` do downsell** (ver abaixo).

## 8. O que falta

| Item | Quem | Onde |
|---|---|---|
| Player VTurb do **upsell** (id + endereço do script) | Time de conteúdo | `upsell.vsl` em `desafio.ts` |
| Segundo do pitch de cada vídeo (`delaySegundos`) | Time de conteúdo | `desafio.ts` |
| Textos finais dos botões "sim"/"não" (hoje provisórios) | Igor | `desafio.ts` |
| **Confirmar o `offer-type` do downsell** no código de incorporação do painel da Cakto (está `downsell` por dedução; o do upsell, `upsell`, veio do painel) | Quem tem a Cakto | `downsell.aceitar.cakto.tipo` |
| **Texto da LP com preço antigo:** o código diz que o Desafio passou de R$ 42 para R$ 64 na Cakto em 21/10 (comentário em `src/lib/precos.ts`), mas `desafio.ts` ainda diz "R$42" e "1 real por dia" (`marca.descricao`, `oferta.reforco`, `oferta.destaque`) e o preço de reserva em `produtos.ts` é 4200. A medição já lê o preço da Cakto; **a copy não** | Igor decide a copy | `desafio.ts`, `produtos.ts` |
| Cadastrar o aviso de venda na Cakto | Quem tem a Cakto | ver seção 9 |
| Regra de cobrança do Shape Insano 360 (hoje **mensal no upsell e anual no downsell**) | Igor + time | produtos na Cakto |
| Confirmar que `flameer.vercel.app` (suporte, privacidade, termos) pode valer também para o Desafio | Time | `rodape` e `suporte` em `desafio.ts` |
| Teste de compra ponta a ponta | Todos | `INTEGRACAO.md`, seção 5.1 |
| **Upsell 2 (Mentoria):** sem checkout e sem página | Igor | — |
| Erros de lint antigos (seção 4) | Dev | — |
| Opcional: `NEXT_PUBLIC_PLAY_STORE_URL` na Vercel (o link já está no código) | — | Vercel |

## 9. Configuração na Cakto (o código não vê o painel)

1. **Aviso de venda (webhook):** `https://www.abdomeninsano.com.br/api/webhook/cakto`, com o segredo
   igual ao `CAKTO_WEBHOOK_SECRET` da Vercel (a Cakto manda o segredo no corpo).
2. **Página de agradecimento** de cada produto:

   | Produto | Vai para |
   |---|---|
   | Upsell (Shape Insano 360) | `https://www.abdomeninsano.com.br/obrigado` |
   | Downsell (Shape Insano 360 com 35%) | `https://www.abdomeninsano.com.br/obrigado` |
   | Desafio | `https://www.abdomeninsano.com.br/shapeinsano-up` — **só depois** do vídeo do upsell estar no ar |

3. O Desafio precisa mandar o comprador ao upsell **por dentro do fluxo da Cakto** — a URL deve chegar
   com `upsellToken`. Sem ele o botão ainda tenta por impressão digital do navegador, mas confirme.
4. **Cobrança do Shape Insano 360:** decidir mensal ou anual e acertar nos dois checkouts.

## 10. Endereços úteis

| O quê | Endereço |
|---|---|
| Checkout do Desafio (front) | `https://pay.cakto.com.br/jegvaw9_1000225` |
| Checkout do upsell | `https://pay.cakto.com.br/39rfuow_1081230` (`offer-id`: `39rfuow`) |
| Checkout do downsell | `https://pay.cakto.com.br/vx548za` (`offer-id`: `vx548za`) |
| Player VTurb do downsell | id `6ad909948b6fe1ef3d42e9dd` · `https://scripts.converteai.net/e8915658-b4e1-47a4-92d6-57532a2ba6da/players/6ad909948b6fe1ef3d42e9dd/v4/player.js` |
| App Store | `https://apps.apple.com/br/app/flameer/id6788119109` |
| Google Play | `https://play.google.com/store/apps/details?id=br.com.flameerapp` |
| Suporte, privacidade, termos | `https://flameer.vercel.app/suporte`, `/privacidade`, `/termos` |
