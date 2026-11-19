# Quiz → cadastro do app

O quiz (`/quiz`) faz várias perguntas que o cadastro do app (Flammer) também
faz. A ideia é que quem compra depois do quiz não responda duas vezes. O elo
entre o quiz e a compra é o **e-mail**: a tela de e-mail do quiz pede para usar
o mesmo na compra, e a conta do app nasce com ele.

## Fase 1: a LP guarda (este repositório)

- O quiz monta o payload com `montarPayload` (`src/components/quiz/motor.ts`).
  Em `app` vão as chaves com os nomes e valores **exatos** do `user_metadata`
  do cadastro do app (`MotorDeCadastro.prepareSignupMetadata`).
- `enviarQuiz` (`src/components/quiz/envio.ts`) faz o POST para `/api/quiz`.
- `/api/quiz` (`src/app/api/quiz/route.ts` + `validar.ts`) valida tudo, descarta
  chave e valor fora da lista do app e faz upsert em `public.quiz_respostas`
  pela service role. A resposta é sempre vazia (204).
- Conferência do mapeamento: `node --experimental-strip-types scripts/checar-quiz.mjs`.

### Para começar a gravar

1. Aplicar `supabase/quiz_respostas.sql` no projeto Supabase compartilhado
   (pelo fluxo de migrations do Flammer). O arquivo **não** foi aplicado.
2. Na Vercel, definir `QUIZ_GRAVAR=1` (Production). As variáveis
   `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` já existem.

Sem os dois passos, a rota só valida e responde 204 (e loga em dev).

## Fase 2: o app importa (Flammer, ainda não feito)

### Quando

Na **primeira entrada** da conta, **depois que o e-mail estiver confirmado**.
Nunca antes: qualquer pessoa pode enviar o quiz com qualquer e-mail, então a
linha só "pertence" a quem provou ser dono do e-mail.

### Como

1. Ler a linha de `quiz_respostas` do e-mail da conta **no servidor**: Edge
   Function ou RPC `SECURITY DEFINER` que pega o e-mail de `auth.jwt()`, confere
   `email_confirmed_at` em `auth.users` e devolve só o `app` daquela linha.
   Nada de função pública executável por `anon`; nada de policy na tabela.
2. Gravar em `user_metadata` **só as chaves presentes** em `app`, sem
   sobrescrever o que a pessoa já respondeu no próprio app.
3. Pular os passos do cadastro já respondidos e perguntar **só o que falta**:
   lesões (`injuries`), alergias/restrições (`allergies`), alimentos que ama e
   que odeia (`loved_foods`, `disliked_foods`), exercícios que odeia
   (`hated_exercises`) e código de indicação (`referral_code`). Mais o que
   faltar no `app` (o quiz pode ter sido abandonado no meio).
4. Marcar `consumido_em = now()` na linha.

> Ponto em aberto: hoje o cadastro do app pergunta tudo **antes** de criar a
> conta, e o `handle_new_user` copia o metadata para `profiles` só no INSERT
> de `auth.users`. Importando depois da confirmação, a conta já existe: a
> função do passo 1 precisa também atualizar `profiles` (com as mesmas
> `sane_*` do gatilho), ou o app precisa reordenar o cadastro para criar a
> conta primeiro. Decidir no Flammer.

### O que o quiz manda em `app`

| chave | origem |
|---|---|
| `name`, `birth_year/month/day`, `height`, `weight`, `desired_weight` | respondidas |
| `training_experience`, `training_frequency`, `workout_place`, `session_time`, `cardio_preference`, `daily_routine`, `meals_count`, `biggest_obstacle`, `aspiration` | respondidas, valor do app |
| `aspiration` (detalhe) | a pergunta "O que você mais quer com o desafio?" é de **múltipla escolha**; o app guarda um valor só, então vai a **primeira marcada na ordem da tela** (`body`, `healthy`, `energy`, `motivation`). A lista inteira vai em `extras.aspiracoes` |
| `goal` | deduzido da meta, com a mesma conta do app (`objetivoPelaMeta`) |
| `training_level` | deduzido da experiência (`derivedTrainingLevel`) |
| `weekly_pace_kg` | só quando `goal = lose`, limitado a 0,5. É o ritmo **pedido** do quiz: o app deve passá-lo pelo `RitmoEfetivo` antes de gravar, como faz com o `speed` do cadastro |
| `gender` = `male`, `workout_focus` = `["Abdômen"]` | **suposições** do funil (quiz só para homens, produto de abdômen): o app pode confirmar em vez de pular |
| `discovery_source` | **inferido** do `utm_source` (anúncio), não perguntado |

`cohort_group` e `card_style` não vêm do quiz: o app calcula como hoje.

### Regras de segurança

- `quiz_respostas` é **só pré-preenchimento**. Nunca usar para liberar acesso,
  confirmar e-mail ou provar compra. O acesso continua vindo da compra
  (`pending_provisions` / compras) como hoje.
- RLS ligada, sem policy, sem grant para `anon` e `authenticated`. Escrita só
  pela service role (rota da LP); leitura só no servidor, na fase 2.
- Nenhum endpoint devolve o conteúdo da tabela para o navegador.
- Os valores passaram pela validação da LP, mas o app deve tratá-los como
  entrada externa: o `handle_new_user` e as CHECK de `profiles` continuam
  sendo o cinto.

## Consentimento de e-mail e dados de terceiros (revisão de 16/11/2026)

- O checkbox do quiz grava só o **pedido** de aceite (`aceite_email`, `aceite_email_em`, versão do texto e navegador). A página é aberta: qualquer pessoa pode digitar o e-mail de outra.
- **E-mail de marketing só para quem confirmar** (`aceite_email_confirmado_em`), clicando num link enviado para o próprio endereço (dupla confirmação). Quem comprou também pode receber os e-mails da compra, que são transacionais.
- O gatilho `quiz_respostas_preservar_aceite` guarda a data do primeiro aceite. Desmarcar num reenvio revoga o aceite e zera as datas.
- Como alguém pode reenviar o quiz com o e-mail de outra pessoa, **o app mostra as respostas importadas para a pessoa confirmar ou editar**. Ele nunca aplica sem mostrar.
