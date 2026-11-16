-- player_eventos: métricas de retenção do Player Insano (o nosso player de VSL,
-- no lugar do VTurb). Uma linha por evento do player.
--
-- NÃO APLICADA. Aplicar à mão no projeto Supabase compartilhado com o app,
-- pelo fluxo de migrations de lá, antes de ligar PLAYER_GRAVAR=1 na Vercel.
-- Detalhes em docs/player-insano.md.
--
-- Quem escreve: só a rota POST /api/player, pela service role, no servidor.
-- Quem lê: só a service role (SQL editor do Supabase ou RPC no servidor),
-- pela função player_retencao abaixo. Nada no navegador lê ou escreve aqui.
--
-- PRIVACIDADE: sem IP, sem user agent, sem e-mail. `sessao` é um id aleatório
-- gerado pelo player a cada visita ao vídeo; não liga a pessoa a nada.
-- Mesmo assim, não há motivo para guardar para sempre. Sugestão: apagar o que
-- tiver mais de 90 dias (à mão, ou agendado com pg_cron se estiver ligado):
--
--   delete from public.player_eventos where criado_em < now() - interval '90 days';
--
--   -- com pg_cron (todo dia às 4h UTC):
--   -- select cron.schedule('player_eventos_90d', '0 4 * * *',
--   --   $$delete from public.player_eventos where criado_em < now() - interval '90 days'$$);
--
-- Os tipos da CHECK são os de TipoEventoPlayer (src/components/player/tipos.ts)
-- e da lista em src/app/api/player/validar.ts. Mudou lá, muda aqui.

create table if not exists public.player_eventos (
    id         bigint      generated always as identity primary key,
    video      text        not null check (video ~ '^[a-z0-9_-]{1,64}$'),
    sessao     text        not null check (length(sessao) between 1 and 64),
    pagina     text        not null check (length(pagina) between 1 and 200),
    tipo       text        not null check (tipo in (
                               'carregou', 'autoplay', 'som', 'play', 'pausa',
                               'progresso', 'retomou', 'do_inicio', 'marco', 'fim'
                           )),
    -- Segundo de CONTEÚDO (video.currentTime), não de relógio.
    segundo    integer     not null check (segundo between 0 and 36000),
    utm        jsonb       not null default '{}'::jsonb check (jsonb_typeof(utm) = 'object'),
    criado_em  timestamptz not null default now()
);

create index if not exists player_eventos_video_criado_em on public.player_eventos (video, criado_em);
create index if not exists player_eventos_video_sessao    on public.player_eventos (video, sessao);

comment on table public.player_eventos is
    'Eventos do Player Insano (retenção da VSL). Sem IP/UA. Escrita só pela service role (/api/player). Apagar após 90 dias.';

-- RLS ligada e SEM policy: anon e authenticated não leem nem escrevem.
alter table public.player_eventos enable row level security;

revoke all on table public.player_eventos from public;
revoke all on table public.player_eventos from anon;
revoke all on table public.player_eventos from authenticated;
grant select, insert, delete on table public.player_eventos to service_role;

-- ---------------------------------------------------------------- retenção
--
-- player_retencao(video, desde): curva de retenção COM SOM de um vídeo, em
-- blocos de 5 s (BLOCO_SEGUNDOS do player), contando só eventos desde `desde`.
--
-- Por sessão:
--   alcance = maior `segundo` de um evento `progresso` (que o player só manda
--             assistindo COM som); se a sessão ligou o som e não tem
--             `progresso`, alcance = 0. Sem som nenhum: fica fora da curva.
--   Uma sessão "chegou" ao bloco b se alcance >= b * 5. Usar o MAIOR progresso
--   (e não contar evento por bloco) deixa a curva sempre descendente, mesmo
--   que algum beacon do meio se perca.
--
-- Colunas:
--   bloco, segundo        índice do bloco e seu início em segundos (bloco * 5);
--   sessoes_com_som       sessões que chegaram ao bloco com som;
--   pct_dos_com_som       % das que ligaram o som (a curva clássica de VSL);
--   pct_do_total          % de todas as sessões do vídeo (inclui quem nunca
--                         ligou o som);
--   total_sessoes         sessões distintas com qualquer evento no período;
--   sessoes_som           sessões que ligaram o som (evento `som` ou algum
--                         `progresso`, que implica som);
--   pct_som               sessoes_som / total_sessoes (igual em todas as linhas).
--
-- Exemplo (SQL editor):
--   select * from public.player_retencao('vsl-downsell', now() - interval '7 days');
-- Pelo servidor: supabaseAdmin().rpc('player_retencao', { video: '...', desde: '...' }).

create or replace function public.player_retencao(video text, desde timestamptz)
returns table (
    bloco            integer,
    segundo          integer,
    sessoes_com_som  bigint,
    pct_dos_com_som  numeric,
    pct_do_total     numeric,
    total_sessoes    bigint,
    sessoes_som      bigint,
    pct_som          numeric
)
language sql
stable
set search_path = ''
as $$
    with por_sessao as (
        select e.sessao,
               bool_or(e.tipo = 'som')                              as ligou_som,
               max(e.segundo) filter (where e.tipo = 'progresso')   as max_progresso
        from public.player_eventos e
        where e.video = player_retencao.video
          and e.criado_em >= player_retencao.desde
        group by e.sessao
    ),
    alcance as (
        select p.sessao,
               case when p.max_progresso is not null then p.max_progresso
                    when p.ligou_som then 0
               end as ate
        from por_sessao p
    ),
    totais as (
        select count(*)                                  as total,
               count(*) filter (where a.ate is not null) as com_som
        from alcance a
    ),
    blocos as (
        select g as bloco
        from generate_series(0, (select coalesce(max(a.ate), -5) from alcance a) / 5) as g
    )
    select b.bloco::integer,
           (b.bloco * 5)::integer,
           count(a.sessao),
           round(100.0 * count(a.sessao) / nullif(t.com_som, 0), 1),
           round(100.0 * count(a.sessao) / nullif(t.total, 0), 1),
           t.total,
           t.com_som,
           round(100.0 * t.com_som / nullif(t.total, 0), 1)
    from blocos b
    cross join totais t
    left join alcance a on a.ate >= b.bloco * 5
    group by b.bloco, t.total, t.com_som
    order by b.bloco;
$$;

comment on function public.player_retencao(text, timestamptz) is
    'Curva de retenção com som do Player Insano, por bloco de 5 s. Só service_role.';

-- Funções nascem executáveis por PUBLIC; no Supabase, anon/authenticated
-- também ganham grant padrão no schema public. Tira tudo e dá só à service role.
revoke all on function public.player_retencao(text, timestamptz) from public, anon, authenticated;
grant execute on function public.player_retencao(text, timestamptz) to service_role;
