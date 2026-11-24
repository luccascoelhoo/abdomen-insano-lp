// Confere a lógica do painel do quiz (src/lib/painel): retenção, maior queda,
// nota por regras e semelhança com comprador. Sem framework: falhou, sai 1.
//
//   node --import ./scripts/alias.mjs scripts/checar-painel.mjs

import assert from 'node:assert/strict';
import { maiorQueda, retencaoPorTela, trechoMedido, ORDEM, CONDICIONAIS } from '../src/lib/painel/funil.ts';
import { faixaDe, notaPorRegras, notaPorSemelhanca, perfilDoComprador } from '../src/lib/painel/score.ts';
import { respostasDaLinha } from '../src/lib/painel/respostas.ts';

let falhas = 0;
function caso(nome, fn) {
  try {
    fn();
    console.log('ok   ', nome);
  } catch (e) {
    falhas += 1;
    console.log('FALHA', nome, '\n', e.message);
  }
}

const linha = (tela, sessoes) => ({ tela, menor_indice: ORDEM.indexOf(tela), sessoes, mediana_s: null });

caso('ordem do quiz: telas info têm nome próprio e nada se repete', () => {
  assert.equal(new Set(ORDEM).size, ORDEM.length);
  assert.ok(ORDEM.some((t) => t.startsWith('info-')));
});

caso('retenção compara pelo caminho comum e pula a condicional', () => {
  const cond = [...CONDICIONAIS][0];
  const i = ORDEM.indexOf(cond);
  const antes = ORDEM.slice(0, i).filter((t) => !CONDICIONAIS.has(t)).at(-1);
  const depois = ORDEM.slice(i + 1).find((t) => !CONDICIONAIS.has(t));
  const telas = retencaoPorTela([linha(antes, 100), linha(cond, 30), linha(depois, 90)]);
  const d = telas.find((t) => t.id === depois);
  assert.equal(d.daAnterior, 90); // contra a anterior comum (100), não contra a condicional (30)
  assert.equal(telas.find((t) => t.id === cond).daAnterior, null);
});

caso('maior queda exige 10 na origem e ignora passagem sem perda', () => {
  const [a, b, c, e] = ORDEM.filter((t) => !CONDICIONAIS.has(t));
  assert.equal(maiorQueda(retencaoPorTela([linha(a, 5), linha(b, 2)])), null);
  assert.equal(maiorQueda(retencaoPorTela([linha(a, 40), linha(b, 40)])), null);
  const q = maiorQueda(retencaoPorTela([linha(a, 100), linha(b, 90), linha(c, 45), linha(e, 44)]));
  assert.equal(q.id, c);
  assert.equal(q.perderam, 45);
});

caso('a curva começa no pico (tela medida depois não vira 3.700%)', () => {
  const [a, b, c] = ORDEM.filter((t) => !CONDICIONAIS.has(t));
  const { curva, base, omitidas } = trechoMedido(retencaoPorTela([linha(a, 1), linha(b, 37), linha(c, 30)]));
  assert.equal(base, 37);
  assert.equal(omitidas.length, 1);
  assert.equal(curva[0].daAnterior, null);
});

caso('nota por regras soma o que bateu e corta nas faixas', () => {
  const r = notaPorRegras({
    respostas: { faixaIdade: '25-34', local: 'full_gym', impediu: ['desisti'], confianca: 'sim' },
    aceiteEmail: true,
    viuOferta: true,
    clicouComprar: true,
  });
  assert.equal(r.nota, 100);
  assert.equal(faixaDe(r.nota), 'quente');
  const frio = notaPorRegras({ respostas: { faixaIdade: '45+' }, aceiteEmail: false, viuOferta: false, clicouComprar: false });
  assert.equal(frio.nota, 0);
  assert.equal(faixaDe(frio.nota), 'frio');
  assert.equal(faixaDe(45), 'morno');
  assert.equal(faixaDe(70), 'quente');
});

caso('semelhança: parecido com comprador sobe, diferente desce, sem compradores não tem sinal', () => {
  const comprador = { local: 'full_gym', objetivo: 'trincado' };
  const outro = { local: 'home', objetivo: 'seco' };
  const todos = [...Array(10).fill(comprador), ...Array(30).fill(outro)];
  const perfil = perfilDoComprador(todos, Array(10).fill(comprador));
  assert.equal(perfil.confianca, 'ok');
  assert.ok(notaPorSemelhanca(comprador, perfil) > 70);
  assert.ok(notaPorSemelhanca(outro, perfil) < 50);
  const vazio = perfilDoComprador(todos, []);
  assert.equal(vazio.confianca, 'nenhuma');
  assert.equal(notaPorSemelhanca(comprador, vazio), null);
  assert.equal(perfilDoComprador(todos, Array(3).fill(comprador)).confianca, 'baixa');
});

caso('respostas: o campo do app volta para a chave do quiz', () => {
  const r = respostasDaLinha({ app: { workout_place: 'full_gym' }, extras: { faixaIdade: '18-24', impediu: ['plano'] } });
  assert.equal(r.local, 'full_gym');
  assert.deepEqual(r.impediu, ['plano']);
});

if (falhas) {
  console.log(`\n${falhas} falha(s)`);
  process.exit(1);
}
console.log('\ntudo certo');
