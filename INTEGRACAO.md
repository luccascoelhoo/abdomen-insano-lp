# Integração — o que falta pra colocar a compra no ar

Este documento descreve tudo que precisa ser configurado **fora do repositório**
pra que o fluxo de compra + cadastro + liberação no app funcione ponta a ponta.

Sem essas variáveis, a página continua no ar em modo "vitrine" (LP com botão que
leva ao Cakto), mas a página `/obrigado` mostra o aviso claro de que o backend
não está configurado.

---

## 1. Variáveis de ambiente

Crie o arquivo `.env.local` na raiz do projeto com as chaves abaixo. Elas nunca
são commitadas — `.env*` já está no `.gitignore`.

```env
# ---------- Site ----------
NEXT_PUBLIC_SITE_URL="https://desafioabdomeninsano.com.br"

# ---------- Supabase (banco compartilhado com o app) ----------
NEXT_PUBLIC_SUPABASE_URL="https://XXXXXXXX.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOi..."      # chave pública (RLS-safe)
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOi..."          # SEGREDO — NUNCA no cliente

# ---------- Cakto (gateway de pagamento) ----------
CAKTO_WEBHOOK_SECRET="cole-aqui-o-segredo-do-webhook"

# ---------- Aplicativo móvel ----------
NEXT_PUBLIC_APP_STORE_URL="https://apps.apple.com/br/app/xxxxx/id0000000000"
NEXT_PUBLIC_PLAY_STORE_URL="https://play.google.com/store/apps/details?id=com.exemplo.abdomeninsano"

# ---------- Suporte (WhatsApp / botão da seção Suporte) ----------
NEXT_PUBLIC_WHATSAPP_URL="https://wa.me/5561999999999?text=Oi%2C%20preciso%20de%20ajuda"

# ---------- Opcional ----------
NEXT_PUBLIC_IMAGENS_PRONTAS="true"                 # quando as fotos dos casos chegarem
```

Em produção (Vercel/Cloudflare/…), essas mesmas chaves precisam ser cadastradas
no painel do provedor. As que começam com `NEXT_PUBLIC_` vão pro browser; as
demais só existem no servidor.

---

## 2. Supabase — criação do banco

Antes de a LP conseguir gravar compras/usuários, execute o SQL abaixo no
**SQL Editor** do projeto Supabase. Ele cria as duas tabelas usadas pelas rotas
`/api/webhook/cakto`, `/api/verificar-compra` e `/api/cadastro`.

```sql
-- ==========================================================
-- Tabela: compras
-- Cada linha = 1 tentativa de compra registrada pelo webhook.
-- (gateway, transacao_id) é a chave lógica — upsert idempotente.
-- ==========================================================
create table if not exists public.compras (
  id              uuid primary key default gen_random_uuid(),
  email           text not null,
  gateway         text not null,
  transacao_id    text not null,
  status          text not null check (status in ('pendente','aprovada','estornada','chargeback')),
  valor_centavos  integer not null default 0,
  utm             jsonb,
  criado_em       timestamptz not null default now(),
  aprovado_em     timestamptz,
  unique (gateway, transacao_id)
);

create index if not exists compras_email_idx  on public.compras (email);
create index if not exists compras_status_idx on public.compras (status);

-- ==========================================================
-- Tabela: usuarios
-- Login do desafio. A senha vai como hash bcrypt gerado no Node.
-- (Se o app já usa Supabase Auth, veja a variação no fim deste bloco.)
-- ==========================================================
create table if not exists public.usuarios (
  id           uuid primary key default gen_random_uuid(),
  email        text not null unique,
  nome         text not null,
  telefone     text,
  senha_hash   text not null,
  compra_id    uuid references public.compras(id) on delete set null,
  criado_em    timestamptz not null default now()
);

create index if not exists usuarios_compra_idx on public.usuarios (compra_id);

-- ==========================================================
-- RLS: as tabelas só devem ser acessíveis pela service role.
-- A LP não usa o cliente anônimo pra escrever, mas deixamos as
-- policies fechadas por segurança.
-- ==========================================================
alter table public.compras  enable row level security;
alter table public.usuarios enable row level security;
-- (sem policies = acesso 100% via service_role)
```

### Se o app usa Supabase Auth em vez de tabela `usuarios`

O código dá pra adaptar em ~15 linhas: em `src/lib/usuario.ts`, troque o
`insert` na tabela por `supabaseAdmin().auth.admin.createUser({ email, password, user_metadata: { nome } })`. A tabela `compras` continua sendo a fonte de
verdade pra saber "esse email pode se cadastrar?".

---

## 3. Cakto — configuração do checkout e do webhook

### 3.1. Página de retorno

No painel Cakto, edite o produto (`jegvaw9_1000225` no `oferta.checkoutUrl`) e
configure a **URL de agradecimento** como:

```
https://desafioabdomeninsano.com.br/obrigado
```

A LP já anexa `email` e `transaction_id` como fallback nos parâmetros de URL,
mas confirme se o Cakto passa essas variáveis no redirect. Se ele passa com
outros nomes, ajuste `src/app/obrigado/page.tsx` — `searchParams` aceita
`email`, `transaction_id`, `tx`.

### 3.2. Webhook (postback)

No painel Cakto → **Integrações → Webhook**, crie um endpoint apontando pra:

```
URL:     https://desafioabdomeninsano.com.br/api/webhook/cakto
Método:  POST
Eventos: pagamento aprovado, estornado, chargeback
Segredo: (cole aqui o mesmo valor de CAKTO_WEBHOOK_SECRET no .env)
```

O nome do header pode variar entre versões do Cakto. A rota
`/api/webhook/cakto` já aceita as três variantes mais comuns:

- `X-Cakto-Signature: <segredo>`
- `X-Webhook-Secret: <segredo>`
- `Authorization: Bearer <segredo>`

Se o painel usar outro header, adicione uma linha em
`src/app/api/webhook/cakto/route.ts` no bloco `assinaturaHeader`.

### 3.3. Formato do postback

O parser é defensivo — aceita várias formas do mesmo campo (`data.customer.email`,
`customer.email`, ou `email` direto). Se aparecer 400 no log com motivo
`campos_obrigatorios_ausentes`, cole o payload real no Slack e a gente ajusta
o `PayloadCakto` em `src/app/api/webhook/cakto/route.ts`.

---

## 4. Links dos aplicativos

Quando os apps forem publicados, atualize `NEXT_PUBLIC_APP_STORE_URL` e
`NEXT_PUBLIC_PLAY_STORE_URL` no `.env.local` (e no painel de deploy).

Enquanto elas estiverem vazias, a página `/obrigado` mostra "Em breve na App
Store / Google Play" no lugar dos botões — **não deixa link quebrado no ar**.

---

## 5. Checklist de teste end-to-end

Sequência recomendada quando as chaves estiverem no lugar:

1. Coloca a LP no ar. Confirma que `/` abre normalmente.
2. Clica em qualquer CTA. Confirma que caiu no checkout Cakto com o parâmetro
   `redirect_url=https://SEU_DOMINIO/obrigado`.
3. Faz uma compra de teste (cartão de teste do Cakto, se houver, ou modo
   sandbox). Confirma no painel Cakto que o pedido saiu `paid`.
4. Vai no Supabase → tabela `compras`: deve ter uma linha com o email da
   compra, status `aprovada`, `aprovado_em` preenchido.
5. Volta pra `/obrigado?email=SEU_EMAIL`. A página deve reconhecer a compra e
   abrir o formulário direto (sem cair no "não achei sua compra").
6. Preenche nome/senha, clica "Criar conta". Deve aparecer a tela verde-preta
   "Bem-vindo ao desafio, X" com dois botões da loja de apps.
7. Vai no Supabase → tabela `usuarios`: deve ter uma linha com email, nome,
   senha_hash (bcrypt) e `compra_id` apontando pra compra do passo 4.
8. Tenta cadastrar de novo com o mesmo email — deve receber "já cadastrado".
9. Tenta cadastrar com um email que nunca comprou — deve receber "não achamos
   sua compra".
10. Simula webhook de reembolso (`status: refunded`) pelo próprio painel
    Cakto e confirma que a linha em `compras` virou `estornada`.

---

## 6. Onde procurar quando algo quebrar

| Sintoma                                              | Onde olhar                                          |
| ---------------------------------------------------- | --------------------------------------------------- |
| `/obrigado` mostra "backend não configurado"         | `.env.local` — chaves do Supabase                   |
| Webhook devolve 401                                  | `CAKTO_WEBHOOK_SECRET` divergente do painel Cakto   |
| Webhook devolve 400 `campos_obrigatorios_ausentes`  | Payload do Cakto mudou — logar `payload` na rota    |
| Cadastro devolve 402 `compra_nao_encontrada`         | Webhook não foi chamado ou email divergente         |
| Botões "Em breve" nunca viram links                  | `NEXT_PUBLIC_APP_STORE_URL` / `_PLAY_STORE_URL` vazias |
| Suporte não aparece na LP                            | `NEXT_PUBLIC_WHATSAPP_URL` vazia                    |

Logs vão pro console do servidor (Vercel: aba **Logs** do deploy).
