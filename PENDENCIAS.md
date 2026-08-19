# O que falta pra LP ficar pronta

Status até este commit: fluxo de compra + cadastro + liberação de acesso está
implementado no código. O que impede o "no ar de verdade" é conteúdo real do
cliente e configuração de infra. Nada aqui é código — é preencher chaves,
soltar arquivos e apertar botões em painel externo.

---

## 🔴 Bloqueadores (sem isso a compra não fecha)

### 1. Supabase — banco compartilhado com o app
- [ ] Criar projeto (ou usar o mesmo do app fitness, se ele já usa Supabase)
- [ ] Executar o SQL de criação das tabelas `compras` e `usuarios` (bloco em `INTEGRACAO.md#2`)
- [ ] Copiar `URL`, `anon key` e `service_role key` do painel
- [ ] Setar `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` na Vercel e no `.env.local`

### 2. Cakto — webhook do postback
- [ ] Painel Cakto → Integrações → Webhook: URL `https://SEU_DOMINIO/api/webhook/cakto`
- [ ] Escolher um segredo forte e colar em `CAKTO_WEBHOOK_SECRET`
- [ ] Configurar página de agradecimento pra `https://SEU_DOMINIO/obrigado`
- [ ] Confirmar que o Cakto passa `email` e `transaction_id` no redirect (senão ajustar o parser em `src/app/api/webhook/cakto/route.ts`)

### 3. Confirmação end-to-end
- [ ] Fazer 1 compra de teste (sandbox ou cartão de teste)
- [ ] Ver a linha aparecer em `compras` no Supabase com status `aprovada`
- [ ] Voltar em `/obrigado?email=...` e criar conta
- [ ] Ver a linha aparecer em `usuarios` com `senha_hash` bcrypt
- [ ] Passos detalhados: `INTEGRACAO.md#5`

---

## 🟡 Bloqueadores parciais (LP funciona, mas parte da experiência fica manca)

### 4. Aplicativos móveis
- [ ] Publicar app na App Store, capturar URL, setar `NEXT_PUBLIC_APP_STORE_URL`
- [ ] Publicar app na Google Play, capturar URL, setar `NEXT_PUBLIC_PLAY_STORE_URL`
- Enquanto vazias, a página `/obrigado` mostra "Em breve" — usuário paga, cadastra, mas não tem onde baixar

### 5. Fotos reais dos alunos (casos)
- [ ] Soltar 10 arquivos em `/public/img/caso-01.jpg` até `caso-10.jpg` (aspect ratios em `src/content/desafio.ts:casos`)
- [ ] Setar `NEXT_PUBLIC_IMAGENS_PRONTAS=true` no `.env.local`
- Hoje mostra placeholders listrados nos depoimentos — matam credibilidade

### 6. Foto e material do idealizador
- [ ] `/public/img/hero-atleta.jpg` (foto do resultado — coluna direita do hero)
- [ ] `/public/img/igor-antes.jpg` e `/public/img/igor-hoje.jpg` (bloco Expert)
- [ ] `/public/img/logo-desafio.png` (logo real; hoje é placeholder)
- [ ] `/public/img/og-card.jpg` 1200x630 (preview de compartilhamento)

### 7. Suporte
- [ ] Setar `NEXT_PUBLIC_WHATSAPP_URL="https://wa.me/..."` — hoje cai no fallback de email
- [ ] Setar `NEXT_PUBLIC_EMAIL_SUPORTE` com o email real de atendimento (fallback usa `suporte@desafioabdomeninsano.com.br` como padrão)

### 8. Domínio + deploy
- [ ] Comprar domínio (ex.: `desafioabdomeninsano.com.br`)
- [ ] Apontar DNS pra Vercel
- [ ] Setar `NEXT_PUBLIC_SITE_URL` com o domínio final
- [ ] Configurar SSL (Vercel resolve automático)

### 9. Páginas legais (links quebrados no rodapé)
- [ ] Criar `/contato`, `/privacidade` e `/termos` — hoje o rodapé lista mas as rotas não existem
- [ ] Termo tem que citar a garantia de 7 dias e política de reembolso do Cakto

---

## 🟢 Recomendado (melhora conversão, não bloqueia)

### 10. Pixel + Conversions API
- [ ] Instalar Meta Pixel base no `layout.tsx`
- [ ] Enviar `Purchase` server-side quando webhook Cakto chega como aprovado (Conversions API) — hoje só temos `InitiateCheckout` no clique
- [ ] Compartilhar `event_id` entre client e server pra deduplicação

### 11. Analytics
- [ ] Google Analytics 4 ou Plausible pra funil
- [ ] Rastrear cliques nos CTAs por posição (`data-origem` já está no DOM)

### 12. Performance mobile
- Score atual: 86 (meta ≥90)
- [ ] Consolidar múltiplos IntersectionObservers num shared observer
- [ ] Cortar Fantasma42 no mobile (parallax invisível em tela pequena)
- [ ] Lazy-load do `DepoimentosPin` via dynamic import
- Detalhes em `~/abdomen-insano-lp-contexto/02-BACKLOG.md#2`

### 13. Copy / conversão
- [ ] Rodar teste A/B da headline (usuário decidiu manter, mas 4 alternativas Ícaro estão em memória)
- [ ] Variar microcopy antifricção por posição (hoje é sempre a mesma frase de garantia)
- [ ] Adicionar prova social específica com número ("+X alunos, média Y cm perdidos" em vez de só "+5.500 alunos")

### 14. Página de login
- [ ] Se o app suporta login web, adicionar `/entrar` pra quem já tem conta e perdeu o link do app
- [ ] Hoje o único caminho é: comprar → cadastrar → baixar app. Se perder a senha, tem que ir no suporte

### 15. Recuperação de senha
- [ ] Endpoint `/api/esqueci-senha` que gera token e envia email
- [ ] Página `/redefinir-senha` que aceita o token
- Fora do escopo desta primeira versão, mas cedo ou tarde alguém vai perder a senha

### 16. Aviso pra quem já comprou e volta na LP
- [ ] Detectar via localStorage se o navegador já finalizou cadastro
- [ ] Mostrar barra no topo: "você já é aluno — abra o app"

---

## Como preencher as env vars sem errar

Copie o bloco de `INTEGRACAO.md#1` pra um `.env.local` na raiz. As chaves com
`NEXT_PUBLIC_` vão pro browser (podem aparecer no bundle); as outras nunca
saem do servidor.

Na Vercel, mesmas chaves em **Settings → Environment Variables**, com o
mesmo nome.
