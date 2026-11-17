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
--   5. Qualquer pessoa pode reenviar o quiz com o e-mail de outra e
--      sobrescrever as respostas. Por isso o app MOSTRA o que importou para a
--      pessoa confirmar/editar; nunca aplica calado.
--
-- CONSENTIMENTO (LGPD): aceite_email é só o PEDIDO, feito numa página aberta a
-- qualquer um. E-mail de marketing só sai para quem tiver
-- aceite_email_confirmado_em (dupla confirmação: clicar no link enviado para o
-- próprio endereço). O primeiro aceite_email_em é preservado pelo gatilho
-- abaixo; desmarcar no reenvio revoga (zera as datas).
--
-- O e-mail é sempre gravado em minúsculas (normalizarEmail da LP); a CHECK
-- garante isso para quem escrever por outro caminho.

create table if not exists public.quiz_respostas (
    email            text        primary key
                                 check (email = lower(email) and length(email) between 3 and 254),
    nome             text        check (nome is null or length(nome) <= 80),
    aceite_email     boolean     not null default false,
    aceite_email_em  timestamptz,
    -- Versão do texto de aceite exibido e navegador (prova do pedido).
    aceite_email_texto text      check (aceite_email_texto is null or length(aceite_email_texto) <= 40),
    aceite_email_ua    text      check (aceite_email_ua is null or length(aceite_email_ua) <= 300),
    -- Dupla confirmação (link no e-mail). Só com isto o e-mail pode receber marketing.
    aceite_email_confirmado_em timestamptz,
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

-- Preserva a data do PRIMEIRO aceite e a confirmação; desmarcar revoga.
create or replace function public.quiz_respostas_preservar_aceite()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    if new.aceite_email then
        new.aceite_email_em := coalesce(old.aceite_email_em, new.aceite_email_em);
        new.aceite_email_confirmado_em := coalesce(new.aceite_email_confirmado_em, old.aceite_email_confirmado_em);
    else
        new.aceite_email_em := null;
        new.aceite_email_confirmado_em := null;
    end if;
    new.criado_em := old.criado_em;
    new.consumido_em := coalesce(new.consumido_em, old.consumido_em);
    return new;
end;
$$;
revoke all on function public.quiz_respostas_preservar_aceite() from public, anon, authenticated;

drop trigger if exists quiz_respostas_preservar_aceite on public.quiz_respostas;
create trigger quiz_respostas_preservar_aceite
    before update on public.quiz_respostas
    for each row execute function public.quiz_respostas_preservar_aceite();

comment on table public.quiz_respostas is
    'Respostas do quiz da LP por e-mail. Só pré-preenchimento do cadastro do app: importar apenas após e-mail confirmado; nunca usar para acesso. Escrita só pela service role (/api/quiz).';

-- RLS ligada e SEM policy: anon e authenticated não leem nem escrevem.
alter table public.quiz_respostas enable row level security;

revoke all on table public.quiz_respostas from public;
revoke all on table public.quiz_respostas from anon;
revoke all on table public.quiz_respostas from authenticated;
grant select, insert, update, delete on table public.quiz_respostas to service_role;
