-- Painel do quiz (/quiz/painel): jornada ligada ao lead, jornada de teste e clique em comprar.
--
-- Aplicar no projeto do app (Flameer). Idempotente: pode rodar de novo.
--
-- O que muda:
--  - `quiz_respostas.sessao`: a sessão do funil por tela de quem deixou o e-mail.
--    É o que liga o lead à jornada dele (quais telas viu, se clicou em comprar).
--  - `teste` nas duas tabelas: jornada do time (`?teste=1` ou e-mail da lista
--    `QUIZ_EMAILS_TESTE`). O painel tira essas jornadas de todos os números.
--  - `quiz_eventos.evento` aceita `checkout` (clicou num botão de compra do quiz).
--  - Duas funções de leitura agregada, só para a service role: a contagem por
--    tela e os degraus do funil. Agregam no banco para o painel não puxar o
--    histórico inteiro de eventos (35 linhas por pessoa que abre o quiz).

alter table public.quiz_respostas
  add column if not exists sessao text check (sessao is null or char_length(sessao) between 8 and 64),
  add column if not exists teste boolean not null default false;
create index if not exists quiz_respostas_sessao_idx on public.quiz_respostas (sessao);

alter table public.quiz_eventos
  add column if not exists teste boolean not null default false;

alter table public.quiz_eventos drop constraint if exists quiz_eventos_evento_check;
alter table public.quiz_eventos
  add constraint quiz_eventos_evento_check check (evento in ('view', 'voltar', 'checkout'));

-- Sessões que contam: fora as marcadas como teste no evento e as que pertencem
-- a um lead marcado como teste (o time testando sem `?teste=1`).
create or replace function public.quiz_painel_sessoes_validas(p_desde timestamptz)
returns table (sessao text)
language sql stable security definer set search_path = public as $$
  select distinct e.sessao
  from quiz_eventos e
  where e.criado_em >= p_desde
    and not e.teste
    and not exists (
      select 1 from quiz_respostas r where r.teste and r.sessao = e.sessao
    );
$$;

-- Quantas sessões distintas viram cada tela, e o tempo mediano gasto nela.
-- Agrupa pelo nome da tela, nunca pelo índice: índice é posição, e posição
-- muda quando uma tela entra ou sai do quiz.
create or replace function public.quiz_painel_telas(p_desde timestamptz)
returns table (tela text, menor_indice int, sessoes bigint, mediana_s numeric)
language sql stable security definer set search_path = public as $$
  with validas as (select sessao from quiz_painel_sessoes_validas(p_desde)),
  vistas as (
    select e.* from quiz_eventos e join validas v using (sessao)
    where e.criado_em >= p_desde and e.evento = 'view'
  ),
  tempos as (
    -- O tempo gasto numa tela chega no evento da tela SEGUINTE (`ms_anterior`).
    select a.tela, percentile_cont(0.5) within group (order by p.ms_anterior) / 1000.0 as mediana_s
    from vistas p
    join vistas a on a.sessao = p.sessao and a.indice = p.indice_anterior
    where p.ms_anterior between 0 and 300000
    group by a.tela
  )
  select v.tela, min(v.indice)::int, count(distinct v.sessao), round(max(t.mediana_s)::numeric, 1)
  from vistas v left join tempos t using (tela)
  group by v.tela
  order by min(v.indice);
$$;

-- Os degraus da jornada, cada um contado por pessoa distinta.
create or replace function public.quiz_painel_degraus(p_desde timestamptz)
returns table (abriram bigint, viram_email bigint, leads bigint, viram_oferta bigint, clicaram bigint, compraram bigint)
language sql stable security definer set search_path = public as $$
  with validas as (select sessao from quiz_painel_sessoes_validas(p_desde)),
  ev as (select e.* from quiz_eventos e join validas v using (sessao) where e.criado_em >= p_desde),
  leads as (select email, criado_em from quiz_respostas where not teste and criado_em >= p_desde)
  select
    (select count(*) from validas),
    (select count(distinct sessao) from ev where evento = 'view' and tela = 'email'),
    (select count(*) from leads),
    (select count(distinct sessao) from ev where evento = 'view' and tela = 'oferta'),
    (select count(distinct sessao) from ev where evento = 'checkout'),
    (select count(distinct lower(c.email)) from compras c
      where c.status = 'aprovada' and c.criado_em >= p_desde
        -- Venda do quiz: saiu do botão do quiz, ou o lead comprou DEPOIS de responder.
        -- Cliente antigo que refaz o quiz não é venda do quiz.
        and (c.utm->>'sck' like 'quiz\_\_%'
             or exists (select 1 from leads l where l.email = lower(c.email) and c.criado_em >= l.criado_em))
        -- Compra de teste do time não é venda do quiz.
        and lower(c.email) not in (select email from quiz_respostas where teste));
$$;

revoke all on function public.quiz_painel_sessoes_validas(timestamptz) from public, anon, authenticated;
revoke all on function public.quiz_painel_telas(timestamptz) from public, anon, authenticated;
revoke all on function public.quiz_painel_degraus(timestamptz) from public, anon, authenticated;
grant execute on function public.quiz_painel_sessoes_validas(timestamptz) to service_role;
grant execute on function public.quiz_painel_telas(timestamptz) to service_role;
grant execute on function public.quiz_painel_degraus(timestamptz) to service_role;
