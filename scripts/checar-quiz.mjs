// Confere que o mapeamento do quiz (`cadastroDoApp` / `montarPayload`, em
// src/components/quiz/calculos.ts) só produz chaves e valores que o cadastro do
// app aceita (a lista de src/app/api/quiz/validar.ts, tirada do Flammer).
//
//   npm run checar
//
// (= node --import ./scripts/resolver-ts.mjs scripts/checar-quiz.mjs; o
// resolver acha os imports sem extensão.) Sem framework de teste: falhou, sai 1.

import assert from 'node:assert/strict';
import { cadastroDoApp, montarPayload } from '../src/components/quiz/calculos.ts';
import { CHAVES_APP_PERMITIDAS, validarCorpoQuiz } from '../src/app/api/quiz/validar.ts';

const utm = { utm_source: 'ig', utm_campaign: 'quiz-teste' };

const base = {
  faixaIdade: '25-34',
  fisico: 'grossa',
  objetivo: 'trincado',
  jaTentou: ['dieta', 'cardio'],
  experiencia: '6m2y',
  local: 'home',
  frequencia: '3-5',
  tempoTreino: '30_45',
  cardio: 'none',
  rotina: 'sedentary',
  sono: '5-6',
  refeicoes: '4',
  obstaculo: 'time',
  altura: 178,
  peso: 98,
  pesoDesejado: 84,
  nascimento: '1990-03-21',
  aspiracoes: ['body'],
  nome: 'João Pedro',
  email: 'Joao.Pedro@Exemplo.com ',
  aceiteEmail: true,
};

let falhas = 0;
function caso(nome, fn) {
  try {
    fn();
    console.log(`ok   ${nome}`);
  } catch (e) {
    falhas += 1;
    console.error(`FAIL ${nome}\n     ${e.message}`);
  }
}

function confereAceito(r, rotulo) {
  const app = cadastroDoApp(r, utm);
  for (const k of Object.keys(app)) assert.ok(CHAVES_APP_PERMITIDAS.has(k), `${rotulo}: chave fora da lista: ${k}`);
  const v = validarCorpoQuiz(montarPayload(r, utm));
  assert.ok(v.ok, `${rotulo}: payload recusado (${v.ok ? '' : v.motivo})`);
  assert.deepEqual(v.descartados, [], `${rotulo}: validação descartou ${v.descartados.join(', ')}`);
  return { app, dados: v.dados };
}

caso('amostra completa passa inteira pela validação', () => {
  const { app, dados } = confereAceito(base, 'completa');
  assert.equal(app.goal, 'lose');
  assert.equal(app.training_level, 'intermediate');
  assert.equal(app.discovery_source, 'instagram');
  assert.equal(app.meals_count, '4');
  assert.deepEqual(app.workout_focus, ['Abdômen']);
  assert.ok(app.weekly_pace_kg >= 0.05 && app.weekly_pace_kg <= 0.5, `ritmo ${app.weekly_pace_kg}`);
  assert.equal(dados.email, 'joao.pedro@exemplo.com');
  assert.equal(app.aspiration, 'body');
  assert.deepEqual(Object.keys(dados.extras).sort(), ['aspiracoes', 'faixaIdade', 'fisico', 'jaTentou', 'objetivo', 'sono']);
});

caso('ritmo nunca passa do teto de perda do app (0,5)', () => {
  const { app } = confereAceito({ ...base, fisico: 'muito-grossa', peso: 160, pesoDesejado: 95 }, 'pesado');
  assert.equal(app.weekly_pace_kg, 0.5);
});

caso('meta a menos de 0,5 kg = maintain e sem ritmo (como o app)', () => {
  const { app } = confereAceito({ ...base, peso: 80, pesoDesejado: 79.6 }, 'manter');
  assert.equal(app.goal, 'maintain');
  assert.equal(app.weekly_pace_kg, undefined);
});

caso('meta exatamente 0,5 kg abaixo = lose (objetivoPelaMeta usa <)', () => {
  const { app } = confereAceito({ ...base, peso: 80, pesoDesejado: 79.5 }, 'meio quilo');
  assert.equal(app.goal, 'lose');
});

caso('ganho de peso: goal gain e sem ritmo', () => {
  const { app } = confereAceito({ ...base, peso: 60, pesoDesejado: 70 }, 'ganho');
  assert.equal(app.goal, 'gain');
  assert.equal(app.weekly_pace_kg, undefined);
});

caso('todas as opções "→ app" do roteiro são aceitas', () => {
  const opcoes = {
    experiencia: ['none', 'lt6m', '6m2y', 'gt2y'],
    local: ['full_gym', 'basic_gym', 'home'],
    frequencia: ['0-2', '3-5', '6+'],
    tempoTreino: ['30_45', '60', '90_plus'],
    cardio: ['post_15', 'session_30_45', 'separate_days', 'none'],
    rotina: ['sedentary', 'active', 'heavy'],
    refeicoes: ['3', '4', '5', '6'],
    obstaculo: ['consistency', 'habits', 'time', 'motivation'],
  };
  for (const [chave, valores] of Object.entries(opcoes)) {
    for (const v of valores) confereAceito({ ...base, [chave]: v }, `${chave}=${v}`);
  }
  for (const v of ['body', 'healthy', 'energy', 'motivation']) {
    const { app } = confereAceito({ ...base, aspiracoes: [v] }, `aspiracoes=[${v}]`);
    assert.equal(app.aspiration, v);
  }
  for (const s of ['tiktok', 'youtube', 'google', 'facebook', '', 'newsletter']) {
    confereAceito(base, `utm_source=${s}`);
    const app = cadastroDoApp(base, { utm_source: s });
    assert.ok(['instagram', 'tiktok', 'youtube', 'google', 'outro'].includes(app.discovery_source));
  }
});

caso('objetivo com várias marcadas: app leva a primeira na ordem da tela, extras levam todas', () => {
  const { app, dados } = confereAceito({ ...base, aspiracoes: ['motivation', 'energy', 'healthy'] }, 'várias');
  assert.equal(app.aspiration, 'healthy');
  assert.deepEqual(dados.extras.aspiracoes, ['motivation', 'energy', 'healthy']);
  const todas = confereAceito({ ...base, aspiracoes: ['energy', 'body', 'motivation', 'healthy'] }, 'todas');
  assert.equal(todas.app.aspiration, 'body');
});

caso('progresso salvo no formato antigo (aspiracao em texto) ainda vira aspiration', () => {
  const semLista = { ...base };
  delete semLista.aspiracoes;
  const { app, dados } = confereAceito({ ...semLista, aspiracao: 'energy' }, 'antigo');
  assert.equal(app.aspiration, 'energy');
  assert.equal(dados.extras.aspiracao, undefined);
});

caso('objetivo sem nenhuma marcada não manda aspiration', () => {
  const { app } = confereAceito({ ...base, aspiracoes: [] }, 'vazio');
  assert.equal(app.aspiration, undefined);
});

caso('quiz parcial (sem números nem nascimento) continua válido', () => {
  confereAceito({ nome: 'Ana', email: 'a@b.co', experiencia: 'none' }, 'parcial');
});

caso('validação recusa/descarta o que o app não aceita', () => {
  const ruim = validarCorpoQuiz({
    email: 'x@y.com',
    nome: 'Zé Silva',
    aceiteEmail: 'sim',
    app: {
      gender: 'other',
      height: 300,
      meals_count: 4,
      birth_year: 2015, birth_month: 1, birth_day: 1,
      workout_focus: ['Abdômen', 'Panturrilha'],
      senha: 'x',
      training_experience: 'gt2y',
      training_level: 'beginner',
    },
    extras: { 'chave inválida': 1, ok: 'sim' },
    utm: { utm_source: 'ig', 'UTM': 'x' },
  });
  assert.ok(ruim.ok);
  assert.deepEqual(ruim.dados.app, { training_experience: 'gt2y' });
  assert.equal(ruim.dados.aceiteEmail, false);
  assert.deepEqual(ruim.dados.extras, { ok: 'sim' });
  assert.deepEqual(ruim.dados.utm, { utm_source: 'ig' });
  assert.equal(validarCorpoQuiz({ email: 'semarroba', nome: 'Zé' }).ok, false);
  assert.equal(validarCorpoQuiz({ email: 'a@b.co', nome: 'Z' }).ok, false);
  assert.equal(validarCorpoQuiz({ email: 'a@b.co', nome: 'Zé', site: 'http://spam' }).isca, true);
});

if (falhas) {
  console.error(`\n${falhas} caso(s) falharam`);
  process.exit(1);
}
console.log('\nmapeamento quiz → app ok');
