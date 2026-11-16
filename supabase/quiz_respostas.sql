-- quiz_respostas: respostas do quiz da LP (/quiz), guardadas por e-mail.
--
-- NÃO APLICADA. Aplicar à mão no projeto Supabase compartilhado com o app
-- (Flammer), pelo fluxo de migrations de lá, antes de ligar QUIZ_GRAVAR=1 na
-- Vercel. Detalhes em docs/quiz-fase2.md.
--
-- FASE 1 (LP): a rota POST /api/quiz valida e faz upsert aqui, pela service
-- role, no servidor. Nada no navegador lê ou escreve nesta tabela.
--
-- FASE 2 (app): o app importa estas respostas para o user_metadata do cadastro
-- e pula os passos já respondidos. Regras que NÃO podem ser quebradas:
--   1. Importar SÓ depois que o e-mail da conta estiver CONFIRMADO, e só a
--      linha do e-mail dessa conta. Qualquer pessoa pode enviar o quiz com
--      qualquer e-mail: sem a confirmação, a linha não prova nada sobre quem
--      está logado.
--   2. NUNCA usar esta tabela para liberar acesso, confirmar e-mail ou
--      provar compra. Ela é só pré-preenchimento; o acesso continua vindo da
--      compra (pending_provisions / compras) como hoje.
--   3. A leitura acontece no servidor (Edge Function ou RPC SECURITY DEFINER
--      que usa auth.jwt() e checa email_confirmed_at). Nenhuma função pública
--      executável por anon; nenhuma policy aberta nesta tabela.
--   4. Ao importar, marcar consumido_em = now().
--
-- O e-mail é sempre gravado em minúsculas (normalizarEmail da LP); a CHECK
-- garante isso para quem escrever por outro caminho.

create table if not exists public.quiz_respostas (
    email            text        primary key
                                 check (email = lower(email) and length(email) between 3 and 254),
    nome             text        check (nome is null or length(nome) <= 80),
    aceite_email     boolean     not null default false,
    aceite_email_em  timestamptz,
    -- Campos com os nomes e valores EXATOS do user_metadata do cadastro do app.
    app              jsonb       not null default '{}'::jsonb check (jsonb_typeof(app) = 'object'),
    -- Respostas do quiz que não existem no app (copy, e-mails, análise).
    extras           jsonb       not null default '{}'::jsonb check (jsonb_typeof(extras) = 'object'),
    utm              jsonb       not null default '{}'::jsonb check (jsonb_typeof(utm) = 'object'),
    criado_em        timestamptz not null default now(),
    atualizado_em    timestamptz not null default now(),
    -- Fase 2: quando o app importou as respostas para a conta.
    consumido_em     timestamptz
);

comment on table public.quiz_respostas is
    'Respostas do quiz da LP por e-mail. Só pré-preenchimento do cadastro do app: importar apenas após e-mail confirmado; nunca usar para acesso. Escrita só pela service role (/api/quiz).';

-- RLS ligada e SEM policy: anon e authenticated não leem nem escrevem.
alter table public.quiz_respostas enable row level security;

revoke all on table public.quiz_respostas from public;
revoke all on table public.quiz_respostas from anon;
revoke all on table public.quiz_respostas from authenticated;
grant select, insert, update, delete on table public.quiz_respostas to service_role;
