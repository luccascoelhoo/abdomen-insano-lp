# Guia para quem vai mexer no projeto

Estado em **29/10/2026**. Leia de cima para baixo antes de abrir qualquer arquivo.
Complementos: [`INTEGRACAO.md`](INTEGRACAO.md) (Cakto, Supabase, roteiro de teste) e
[`PENDENCIAS.md`](PENDENCIAS.md) (pendências gerais da LP).

---

## 1. O repositório certo

| O quê | Onde |
|---|---|
| **Código de produção (este repo)** | `github.com/luccascoelhoo/abdomen-insano-lp`, branch `main` |
| Site no ar | `https://www.abdomeninsano.com.br` (o domínio sem `www` redireciona para ele) |
| **Página de vendas oficial** | A **V.2** (`/`). Copy em `src/content/lp-v2.ts`, componentes em `src/components/v2/`, CSS em `src/app/v2/v2.css` |
| Página de vendas anterior (V.1) | Guardada em `/antiga` (fora do Google) e na etiqueta `lp-v1-antiga` do Git. `/v2` só redireciona para `/` |
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
Desafio (checkout Cakto) ──▶ /shapeinsano-up ── "sim" ──▶ checkout do upsell (assinatura anual)
                                   │
                                   ├ "não" ──▶ /shapeinsano-down ── "sim" ──▶ checkout do downsell
                                   │                      └ "não" ──▶ /obrigado
                                   └ "Pular a oferta…" (sempre visível) ──▶ /obrigado
```

| O quê | Onde |
|---|---|
| Copy, vídeos, textos dos botões, ids das ofertas | `src/content/desafio.ts` (`upsell`, `downsell`) |
| **Ordem do funil e quando uma página está "pronta"** | `src/lib/funil.ts` |
| Layout das páginas, player VTurb, botões | `src/components/funil/` e `src/app/shapeinsano-up`, `shapeinsano-down` |
| Preço, recorrência e desconto **lidos da Cakto** (nada de venda escrito à mão) | `src/lib/precos.ts`, `src/lib/condicoes.ts`, `src/lib/parcelamento.ts` |
| Catálogo de produtos, classificação de venda por oferta e valor | `src/lib/produtos.ts` |
| Pixel, `event_id`, segunda perna pelo servidor | `src/lib/pixel.ts`, `src/app/api/evento` |
| Aviso de venda da Cakto → banco, Meta, painel da agência | `src/app/api/webhook/cakto` |
| `Purchase` do navegador, sem contar duas vezes | `src/components/ui/PurchaseTracker.tsx` |

**Regras que o código garante:**

- Uma página só entra no caminho quando está **pronta**: tem vídeo (id e script da VTurb) **e** link de
  checkout. Hoje **as duas estão prontas: o funil está LIGADO** e o checkout do Desafio devolve o
  comprador em `/shapeinsano-up`.
- **O downsell não é porta de entrada**, só a segunda chance de quem recusou o upsell (correção no PR #19).
- Os botões do upsell/downsell ficam **escondidos até o pitch** (`delaySegundos`: 611 s no upsell, 60 s
  no downsell). Quem só quer o acesso tem o link "Pular a oferta…" (PR #19) e, se o player da VTurb não
  carregar, os botões aparecem sozinhos.
- Preço e periodicidade vêm da Cakto: **quem mexe no painel mexe no texto**, sem deploy. A exceção
  deliberada é `descontoDeclarado` (o 60% do downsell, decisão de marketing).
- A query (e-mail, transação, UTM, cookies do pixel) acompanha a pessoa de página em página.

## 7. Estado em 29/10/2026

**No ar:** a V.2 como home; a V.1 em `/antiga`; o funil de upsell e downsell ligado, com os dois vídeos e
a assinatura anual declarada no botão (PR #12); rastreamento por degrau; clique de compra medido (#6);
preço lido da Cakto (#8, #12); links de rodapé, suporte e lojas (#7, #15).

**Abertos:**

| PR | O quê | O que fazer |
|---|---|---|
| #19 | Link "Pular a oferta" sempre visível + downsell nunca é porta de entrada | Mergear |
| #9 | Mesma correção da lógica do funil, mas **tem conflito** e foi superada | Fechar |
| #10 | Botão de um clique da Cakto | **Não mergear agora**: no cartão cobra na hora, sem confirmação, o que contradiz o upsell "honesto" do #12 (assinatura de R$ 197/ano); e o `offer-type` do downsell nunca foi confirmado |

## 8. O que falta

| Item | Quem | Onde |
|---|---|---|
| **Teste de compra ponta a ponta pela V.2** (nunca foi feito) | Igor + time | ver `INTEGRACAO.md`, seção 5.1 |
| Token da API de Conversão na Cakto e pixel nas 3 ofertas (`facebook_pixels: []`: é por isso que o checkout em si não mede) | Quem tem a Cakto | painel da Cakto |
| **Taxa de serviço de R$ 0,99** somada no checkout (total R$ 64,99; a página anuncia R$ 64) | Igor decide | painel da Cakto |
| **Banner do checkout** diz "1 real por dia… em breve aumentaremos o preço"; a V.2 diz "menos de R$2 por dia" | Igor | painel da Cakto |
| **Parcela:** a copy pedia "5 reais"; a Cakto cobra **12x de R$ 6,62** (repassa os juros). A página mostra o real. Absorver os juros daria 12x de R$ 5,33 | Igor decide | painel da Cakto |
| Prazo da **garantia de 15 dias** igual na Cakto e nos termos (`flameer.vercel.app/termos`) | Igor | Cakto, termos |
| Suporte, privacidade e termos de `flameer.vercel.app` valem também para o Desafio? | Time | `rodape` e `suporte` em `desafio.ts` |
| Copy da V.2: "R$ 1,52 por dia" virou "menos de R$2"; bônus somam R$ 377 e a copy diz "mais de R$ 300" | Igor, se quiser mudar | `lp-v2.ts` |
| **Upsell 2 (Mentoria):** sem checkout e sem página | Igor | — |
| Erros de lint antigos (seção 4) | Dev | — |

## 9. Configuração na Cakto (o código não vê o painel)

1. **Aviso de venda (webhook):** `https://www.abdomeninsano.com.br/api/webhook/cakto`, com o segredo
   igual ao `CAKTO_WEBHOOK_SECRET` da Vercel (a Cakto manda o segredo no corpo).
2. **Página de agradecimento** de cada produto:

   | Produto | Vai para |
   |---|---|
   | Upsell (Shape Insano 360) | `https://www.abdomeninsano.com.br/obrigado` |
   | Downsell (Shape Insano 360 com 35%) | `https://www.abdomeninsano.com.br/obrigado` |
   | Desafio | `https://www.abdomeninsano.com.br/shapeinsano-up` (o site também manda este endereço no `redirect_url`) |

3. O Desafio precisa mandar o comprador ao upsell **por dentro do fluxo da Cakto** — a URL deve chegar
   com `upsellToken`. Sem ele o botão ainda tenta por impressão digital do navegador, mas confirme.
4. **Cobrança do Shape Insano 360:** hoje **anual (R$ 197 a cada 365 dias)**; a página declara isso e lê a periodicidade da Cakto. Se mudar no painel, o texto muda sozinho.

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
