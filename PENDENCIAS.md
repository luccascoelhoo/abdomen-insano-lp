# O que falta — Desafio Abdômen Insano

> Atualizado em **22/10/2026**. Tudo aqui foi medido, não suposto: preço e
> recorrência vêm da API da Cakto, o estado da produção vem do HTML publicado,
> e o estado das variáveis vem do diagnóstico do próprio webhook.
>
> Como conferir as variáveis sem esperar venda:
> `curl -H "x-cakto-signature: SEU_SEGREDO" https://www.abdomeninsano.com.br/api/webhook/cakto`

---

## 🔴 Trava dinheiro

| | O quê | Onde | Estado |
|---|---|---|---|
| 1 | **Publicar o trabalho da branch** `fix/preco-64-e-upsell-honesto` | push → PR → merge → deploy | **5 commits prontos, nada empurrado** |
| 2 | Token da API de Conversão | Cakto → Configurar Pixel → ⚙ → Salvar | aberto · 5 min · **ativa em 24–48h** |
| 3 | ~~CAKTO_WEBHOOK_SECRET na Vercel~~ | — | ✅ **JÁ FEITO** — produção responde 401, não 503 |
| 4 | Desligar o upsell no painel | Cakto → Upsell e Downsell | **só enquanto o item 1 não subir** |
| 5 | Pixel nas ofertas (`facebook_pixels: []` nas três) | Cakto → cada oferta | aberto — é por isso que o checkout não mede |

**O item 1 destrava sozinho os itens 6, 7, 8 e 9** — está tudo no mesmo branch.

**Sobre o item 4:** a produção ainda serve a página velha do upsell, que diz
"Compra em andamento" para quem já pagou. Enquanto ela estiver de pé, cada
venda pode virar reclamação. **Se o item 1 subir hoje, o 4 deixa de existir**,
porque a página nova é honesta e já tem as VSLs. Se não subir, desligue.

---

## 🟡 Na LP — feito, aguardando o item 1

| | O quê | Estado |
|---|---|---|
| 6 | Texto dizia que a compra "ainda está em andamento" | ✅ feito · agora "Sua compra está confirmada" |
| 7 | Preço e "assinatura" visíveis no botão do upsell | ✅ feito · condições acima do botão, vindas da Cakto |
| 8 | Tirar o "1 real por dia" (prometia R$ 42; a oferta é R$ 64) | ✅ feito · card lê o preço vivo |
| 9 | VSLs nas duas páginas, com gatilho do botão | ✅ feito · 10:11 e 1:00, com rede de segurança |

---

## 🟡 Na LP — ainda abertos

| | O quê | Por quê importa |
|---|---|---|
| 10 | **Mapear o Shape Insano 360** | Confirmado no código: o webhook **mede** a compra do upsell mas **não libera nada**. Quem comprar hoje paga e não recebe |
| 11 | **Cookies / LGPD** | A LP carrega Google Tag Manager (4 ocorrências) sem nenhum aviso — `cookie`, `consent` e `LGPD` dão zero |
| 12 | **Order bumps cegos** | Os 3 bumps não têm oferta ligada e os preços não batem com nada na Cakto. Toda venda de bump cai como "não classificada" no Meta |

---

## ⏳ Esperando terceiros

| | O quê |
|---|---|
| 13 | Domínio de rastreamento — Cakto pôs na fila. Não bloqueia |

---

## Decisões do dono em aberto

- **Downsell para R$ 147**: ainda está R$ 127 na Cakto. Quando mudar, preço,
  rótulo e percentual acompanham sozinhos, sem deploy.
- **O desconto anunciado**: a âncora de marketing é R$ 299, declarada em
  `content/desafio.ts`. Contra R$ 127 dá **57%**, não 60% — para 60% cravado o
  preço precisaria ser R$ 119,60. A página mostra o número real.
  ⚠️ R$ 299 não existe na Cakto; preço de referência não praticado é risco de CDC.
- **Order bump**: existem duas ofertas candidatas — `nssf8kw` "Order Bump - DAI"
  (R$ 14,90, bate com o valor do código) e `d8xm7t4` "Operação -3kg em 10 Dias"
  (R$ 47, bate com o nome). Qual é a do checkout do Desafio?
- **Oferta velha ativa**: `7vMeSed` "Desafio Abdômen Insano" R$ 42, como
  assinatura de 90 dias. Se algum link antigo aponta para ela, tem gente
  comprando por R$ 42 trimestral.

---

## Números (reportados na auditoria de 22/10, não medidos por mim)

| | |
|---|---|
| Receita real | R$ 13,79 — 5 vendas, todas internas |
| Purchase no Meta | 0 |
| VSLs no ar | 0 de 2 |
| E-mails com erro | 0 |
| Segurança | sem pendência |
