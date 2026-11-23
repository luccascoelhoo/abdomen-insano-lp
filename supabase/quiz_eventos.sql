-- Funil do quiz: um evento por tela vista, anônimo (sem e-mail, nome ou IP).
-- RLS ligada e sem policy: só a service role (rota /api/quiz/evento) grava e
-- só a função quiz_funil (service role, chamada pelo painel) lê.
create table if not exists public.quiz_eventos (
  id bigint generated always as identity primary key,
  sessao text not null check (char_length(sessao) between 8 and 64),
  evento text not null check (evento in ('view', 'voltar')),
  indice smallint not null check (indice between 0 and 200),
  tela text not null check (char_length(tela) <= 40),
  indice_anterior smallint,
  ms_anterior integer check (ms_anterior is null or ms_anterior >= 0),
  origem text check (origem is null or char_length(origem) <= 60),
  criado_em timestamptz not null default now()
);
alter table public.quiz_eventos enable row level security;
revoke all on public.quiz_eventos from anon, authenticated;
create index if not exists quiz_eventos_criado_idx on public.quiz_eventos (criado_em);
create index if not exists quiz_eventos_sessao_idx on public.quiz_eventos (sessao);

-- Funil por tela nos últimos p_dias dias: quantas sessões chegaram, quanto %
-- do início e da tela anterior, e o tempo mediano na tela (ignora >5 min, que é aba esquecida).
create or replace function public.quiz_funil(p_dias int default 7)
returns table (indice int, tela text, sessoes bigint, pct_inicio numeric, pct_anterior numeric, mediana_s numeric)
language sql stable security definer set search_path = public as $$
  with base as (
    select * from quiz_eventos where criado_em >= now() - make_interval(days => greatest(p_dias, 1))
  ),
  telas as (
    select indice, max(tela) as tela, count(distinct sessao) as sessoes
    from base where evento = 'view' group by indice
  ),
  tempos as (
    select indice_anterior as indice,
           percentile_cont(0.5) within group (order by ms_anterior) / 1000.0 as mediana_s
    from base where evento = 'view' and indice_anterior is not null and ms_anterior between 0 and 300000
    group by indice_anterior
  )
  select t.indice::int, t.tela, t.sessoes,
         round(100.0 * t.sessoes / nullif(first_value(t.sessoes) over (order by t.indice), 0), 1),
         round(100.0 * t.sessoes / nullif(lag(t.sessoes) over (order by t.indice), 0), 1),
         round(tm.mediana_s::numeric, 1)
  from telas t left join tempos tm using (indice)
  order by t.indice;
$$;
revoke all on function public.quiz_funil(int) from public, anon, authenticated;
grant execute on function public.quiz_funil(int) to service_role;
