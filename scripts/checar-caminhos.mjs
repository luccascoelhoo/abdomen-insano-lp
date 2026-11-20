// Percorre MUITOS caminhos de resposta do quiz (o roteiro real de
// src/content/quiz.ts, pulando as telas com `quando` como o motor faz) e
// confere o que cada pessoa veria no fim:
//
//  1. Diagnóstico: toda trava se explica por uma resposta dada NO CAMINHO
//     FINAL. Nada de "Bebida e petisco" para quem só disse que bebe no fim de
//     semana (feedback de 19/11/2026), nem trava de tela que ficou oculta.
//  2. A trava principal respeita "O que mais te travou até hoje?".
//  3. Nenhum texto de tela sai com "undefined", "NaN", "null" ou vazio.
//  4. O cadastro do app e o payload passam inteiros pela validação da API.
//  5. O e-mail do plano monta sem erro.
//
//   node --import ./scripts/resolver-ts.mjs scripts/checar-caminhos.mjs
//
// Sem framework de teste: falhou, sai 1. Aleatório com semente fixa (repetível);
// `SEMENTE=123 CAMINHOS=50000` muda a amostra.

import assert from 'node:assert/strict';
import { telasQuiz, textosResultado } from '../src/content/quiz.ts';
import { ofertaV2 } from '../src/content/lp-v2.ts';
import {
  TOTAL_TRAVAS,
  cadastroDoApp,
  chegadaNaMeta,
  montarPayload,
  projecao,
  semRespostasOcultas,
  texto,
  todasAsTravas,
  travas,
} from '../src/components/quiz/calculos.ts';
import { validarCorpoQuiz } from '../src/app/api/quiz/validar.ts';
import { emailPlano, emailLembrete } from '../src/lib/email/quiz-emails.ts';
import { descontoPercentual, PRECO_REFERENCIA_CENTAVOS } from '../src/lib/desconto.ts';
import { baseDaOrigem, caminhoDaPagina, origemDoFunil, sckDaCompra, urlDaPaginaDoSck } from '../src/lib/pagina-de-origem.ts';

let falhas = 0;
function caso(nome, fn) {
  try {
    fn();
    console.log(`ok   ${nome}`);
  } catch (e) {
    falhas += 1;
    console.error(`FAIL ${nome}\n     ${e.message.split('\n').join('\n     ')}`);
  }
}

/* ---------------------------------------------------------------- sorteio */

let semente = Number(process.env.SEMENTE ?? 19112026) >>> 0;
function aleatorio() {
  // mulberry32: rápido e repetível.
  semente = (semente + 0x6d2b79f5) >>> 0;
  let t = semente;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const sortear = (lista) => lista[Math.floor(aleatorio() * lista.length)];
const inteiro = (min, max) => min + Math.floor(aleatorio() * (max - min + 1));

function sortearMulti(opcoes) {
  const exclusiva = opcoes.find((o) => o.exclusiva);
  if (exclusiva && aleatorio() < 0.15) return [exclusiva.v];
  const normais = opcoes.filter((o) => !o.exclusiva).map((o) => o.v);
  const marcadas = normais.filter(() => aleatorio() < 0.4);
  return marcadas.length ? marcadas : [sortear(normais)];
}

const NOMES = ['joão pedro', 'Ana', 'GABRIEL', 'Zé', 'mário  augusto', 'Luís'];
const dataISO = (d) => d.toISOString().slice(0, 10);

/** Uma resposta sorteada para a tela, no formato que o componente grava. */
function respostaPara(tela) {
  switch (tela.k) {
    case 'abertura':
    case 'cards':
    case 'lista':
      return { [tela.chave]: sortear(tela.opcoes).v };
    case 'multi':
      return { [tela.chave]: sortearMulti(tela.opcoes) };
    case 'numero':
      return { [tela.chave]: inteiro(tela.min, tela.max) };
    case 'nascimento': {
      // A tela bloqueia menores de 18; o -1 garante 18 anos completos em qualquer mês.
      const idade = inteiro(18, 70);
      return { nascimento: `${new Date().getFullYear() - idade - 1}-${String(inteiro(1, 12)).padStart(2, '0')}-${String(inteiro(1, 28)).padStart(2, '0')}` };
    }
    case 'dataEvento':
      return { [tela.chave]: dataISO(new Date(Date.now() + inteiro(1, tela.maxDias) * 86_400_000)) };
    case 'nome':
      return { nome: sortear(NOMES) };
    case 'email':
      return { email: `teste${inteiro(1, 9999)}@exemplo.com`, aceiteEmail: aleatorio() < 0.5 };
    default:
      return null;
  }
}

/** Todo texto que a tela mostra com estas respostas. */
function textosDaTela(tela, r) {
  const t = [];
  for (const campo of ['titulo', 'sub', 'pergunta', 'botao', 'aviso', 'destaque']) {
    if (tela[campo] !== undefined) t.push([campo, texto(tela[campo], r)]);
  }
  for (const [i, l] of (tela.linhas ?? []).entries()) t.push([`linhas[${i}]`, texto(l, r)]);
  for (const o of tela.opcoes ?? []) t.push([`opção ${o.v}`, o.rotulo]);
  return t;
}

const LIXO = /undefined|NaN|\bnull\b|\[object/;

/**
 * Anda pelo roteiro como o motor: tela visível responde e avança, oculta é
 * pulada. Às vezes VOLTA algumas telas e troca respostas (o caminho que mais
 * gera resposta velha). Devolve as respostas finais e as telas vistas.
 */
function caminhar() {
  let r = {};
  const vistas = [];
  let i = 0;
  let voltas = 0;
  while (i < telasQuiz.length) {
    const tela = telasQuiz[i];
    if (tela.quando && !tela.quando(r)) {
      i += 1;
      continue;
    }
    for (const [campo, valor] of textosDaTela(tela, r)) {
      // Linha vazia em tela de info é de propósito: o TelaInfo a filtra.
      const podeVazio = campo.startsWith('linhas[');
      assert.ok((valor || podeVazio) && !LIXO.test(valor), `tela ${i} (${tela.k}) ${campo}: "${valor}"`);
    }
    if (tela.linhas) assert.ok(tela.linhas.some((l) => texto(l, r)), `tela ${i} (${tela.k}) sem nenhuma linha de texto`);
    const nova = respostaPara(tela);
    if (nova) r = semRespostasOcultas(telasQuiz, { ...r, ...nova });
    vistas.push(i);
    // De vez em quando a pessoa volta 1 a 6 telas (como no botão Voltar).
    if (voltas < 3 && aleatorio() < 0.04 && tela.k !== 'email' && i > 2) {
      voltas += 1;
      let alvo = i - inteiro(1, 6);
      while (alvo > 0 && telasQuiz[alvo].quando && !telasQuiz[alvo].quando(r)) alvo -= 1;
      i = Math.max(0, alvo);
      continue;
    }
    i += 1;
  }
  return { r, vistas };
}

/* ----------------------------------------------- de onde cada trava vem */

const lista = (v) => (Array.isArray(v) ? v : []);
const ROTULO_HABITO = { delivery: 'delivery', refri: 'refrigerante', doce: 'doce' };

/** A explicação de cada trava: a(s) resposta(s) que a justificam. */
function justificativa(t, r) {
  const habitos = lista(r.habitos);
  const impediu = lista(r.impediu);
  switch (t.id) {
    case 'calorias': {
      const marcados = ['delivery', 'refri', 'doce'].filter((h) => habitos.includes(h)).map((h) => ROTULO_HABITO[h]);
      assert.ok(marcados.length, 'calorias sem nenhum hábito de delivery/refri/doce marcado');
      for (const nome of Object.values(ROTULO_HABITO)) {
        assert.equal(t.titulo.includes(nome), marcados.includes(nome), `título "${t.titulo}" e marcados ${marcados}`);
      }
      return;
    }
    case 'belisca':
      return assert.ok(habitos.includes('belisca'), 'belisca sem marcar');
    case 'pula':
      return assert.ok(habitos.includes('pula'), 'pula sem marcar');
    case 'bebida':
      assert.ok(r.alcool === 'fds' || r.alcool === 'semana', `bebida com alcool=${r.alcool}`);
      return assert.equal(t.titulo, r.alcool === 'fds' ? 'Bebida no fim de semana' : 'Bebida várias vezes na semana');
    case 'sanfona':
      return assert.ok(
        r.dietaAntes === 'voltou' || r.dietaAntes === 'fome' || impediu.includes('fome') || impediu.includes('desisti'),
        `sanfona sem dieta/fome/desisti (dietaAntes=${r.dietaAntes}, impediu=${impediu})`,
      );
    case 'plano':
      return assert.ok(impediu.includes('plano'), 'plano sem marcar');
    case 'tempo':
      return assert.ok(impediu.includes('tempo') || r.obstaculo === 'time', 'tempo sem resposta');
    case 'motivacao':
      return assert.ok(impediu.includes('motivacao') || r.obstaculo === 'motivation', 'motivação sem resposta');
    case 'abdominal':
      return assert.ok(lista(r.jaTentou).includes('abdominal'), 'abdominal sem marcar');
    case 'sentado':
      return assert.equal(r.rotina, 'sedentary');
    case 'genetica':
      return assert.ok(impediu.includes('genetica'), 'genética sem marcar');
    default:
      throw new Error(`trava sem regra de checagem: ${t.id}`);
  }
}

/** O inverso: toda resposta que gera trava gera mesmo (nada some). */
function esperadas(r) {
  const habitos = lista(r.habitos);
  const impediu = lista(r.impediu);
  const ids = new Set();
  if (habitos.some((h) => ['delivery', 'refri', 'doce'].includes(h))) ids.add('calorias');
  if (habitos.includes('belisca')) ids.add('belisca');
  if (habitos.includes('pula')) ids.add('pula');
  if (r.alcool === 'fds' || r.alcool === 'semana') ids.add('bebida');
  if (r.dietaAntes === 'voltou' || r.dietaAntes === 'fome' || impediu.includes('fome') || impediu.includes('desisti')) ids.add('sanfona');
  if (impediu.includes('plano')) ids.add('plano');
  if (impediu.includes('tempo') || r.obstaculo === 'time') ids.add('tempo');
  if (impediu.includes('motivacao') || r.obstaculo === 'motivation') ids.add('motivacao');
  if (lista(r.jaTentou).includes('abdominal')) ids.add('abdominal');
  if (r.rotina === 'sedentary') ids.add('sentado');
  if (impediu.includes('genetica')) ids.add('genetica');
  return ids;
}

const PRINCIPAL = {
  habits: ['calorias', 'belisca', 'pula', 'bebida'],
  time: ['tempo'],
  motivation: ['motivacao'],
  consistency: ['sanfona', 'plano'],
};

function conferirTravas(r) {
  const ts = todasAsTravas(r);
  const ids = ts.map((t) => t.id);
  assert.equal(new Set(ids).size, ids.length, `trava repetida: ${ids}`);
  assert.ok(ts.length <= TOTAL_TRAVAS, `${ts.length} travas > TOTAL_TRAVAS ${TOTAL_TRAVAS}`);
  assert.deepEqual(new Set(ids), esperadas(r), 'travas diferentes das respostas');
  for (const t of ts) {
    justificativa(t, r);
    for (const campo of ['titulo', 'texto', 'plano']) {
      assert.ok(t[campo] && !LIXO.test(t[campo]), `trava ${t.id}.${campo}: "${t[campo]}"`);
      assert.ok(!/petisc/i.test(t[campo]), `trava ${t.id} fala de petisco, que não é opção do quiz`);
    }
  }
  const preferida = (PRINCIPAL[r.obstaculo] ?? []).find((id) => ids.includes(id));
  if (preferida) assert.equal(ids[0], preferida, `principal ${ids[0]}, mas obstaculo=${r.obstaculo} pede ${preferida}`);
  assert.deepEqual(travas(r), ts.slice(0, 3));
  return ts;
}

/** Nenhuma resposta guardada de tela que a pessoa não viu no caminho final. */
function conferirSemOcultas(r) {
  for (const t of telasQuiz) {
    if (!('chave' in t) || !t.quando || t.quando(r)) continue;
    const visivelEmOutra = telasQuiz.some((o) => o !== t && o.chave === t.chave && (!o.quando || o.quando(r)));
    assert.ok(visivelEmOutra || !(t.chave in r), `resposta "${t.chave}" de tela oculta ficou guardada`);
  }
}

/* ------------------------------------------------------------- os casos */

caso('o caso do Frantinha: delivery + pular refeição + bebe no fim de semana', () => {
  const r = { habitos: ['delivery', 'pula'], alcool: 'fds', impediu: ['desisti'], jaTentou: ['abdominal'], tentou: 'sim', obstaculo: 'habits' };
  const ts = conferirTravas(r);
  assert.equal(ts[0].titulo, 'Calorias de delivery');
  assert.ok(ts.some((t) => t.titulo === 'Pular refeições'), 'pular refeição sumiu do diagnóstico');
  assert.ok(ts.some((t) => t.titulo === 'Bebida no fim de semana'));
  // Mesmo sem preferência, os hábitos marcados vêm antes da bebida.
  const semPreferencia = todasAsTravas({ ...r, obstaculo: 'consistency', impediu: [] });
  assert.equal(semPreferencia[0].id, 'calorias');
});

caso('três hábitos de calorias viram "delivery, refrigerante e doce"', () => {
  const [t] = todasAsTravas({ habitos: ['doce', 'refri', 'delivery'] });
  assert.equal(t.titulo, 'Calorias de delivery, refrigerante e doce');
});

caso('"Nenhum desses" não gera trava de hábito', () => {
  const ids = todasAsTravas({ habitos: ['nenhum'], alcool: 'nunca' }).map((t) => t.id);
  assert.deepEqual(ids, []);
});

caso('obstáculo "falta de tempo" vira a principal mesmo sem marcar em "o que te impediu"', () => {
  const ts = conferirTravas({ habitos: ['delivery'], alcool: 'semana', obstaculo: 'time' });
  assert.equal(ts[0].id, 'tempo');
});

caso('trocar para "nunca tentei" depois de responder tira as respostas das telas puladas', () => {
  const antes = { tentou: 'sim', jaTentou: ['abdominal'], dietaAntes: 'voltou', impediu: ['genetica', 'plano'], alcool: 'nunca' };
  const depois = semRespostasOcultas(telasQuiz, { ...antes, tentou: 'nunca' });
  for (const k of ['jaTentou', 'dietaAntes', 'impediu']) assert.equal(depois[k], undefined, `${k} ficou`);
  assert.deepEqual(todasAsTravas(depois).map((t) => t.id), []);
  conferirSemOcultas(depois);
});

caso('trocar o compromisso para "nenhum" tira a data do evento', () => {
  const telaEvento = telasQuiz.find((t) => t.chave === 'evento');
  const nenhum = telaEvento.opcoes.find((o) => !['praia', 'casamento', 'aniversario', 'reencontro', 'trabalho'].includes(o.v));
  assert.ok(nenhum, 'opção sem evento não encontrada');
  const r = semRespostasOcultas(telasQuiz, { evento: nenhum.v, dataEvento: '2027-01-10' });
  assert.equal(r.dataEvento, undefined);
});

caso('cada chave de resposta pertence a uma tela só', () => {
  const chaves = telasQuiz.filter((t) => 'chave' in t).map((t) => t.chave);
  assert.equal(new Set(chaves).size, chaves.length, `chave repetida em ${chaves}`);
});

caso('TOTAL_TRAVAS ("N de 11") é o máximo que dá pra ter', () => {
  const r = {
    habitos: ['delivery', 'belisca', 'pula'],
    alcool: 'semana',
    dietaAntes: 'voltou',
    impediu: ['plano', 'tempo', 'motivacao', 'genetica'],
    jaTentou: ['abdominal'],
    rotina: 'sedentary',
  };
  assert.equal(conferirTravas(r).length, TOTAL_TRAVAS);
});

caso('exaustivo: toda combinação de hábitos, bebida, impedimentos, dieta, obstáculo e rotina', () => {
  const opcoesDe = (chave) => telasQuiz.find((t) => t.chave === chave).opcoes;
  const subconjuntos = (vs) => vs.reduce((acc, v) => acc.concat(acc.map((s) => [...s, v])), [[]]);
  const hab = opcoesDe('habitos');
  const combosHab = [['nenhum'], ...subconjuntos(hab.filter((o) => !o.exclusiva).map((o) => o.v)).filter((s) => s.length)];
  const combosImp = subconjuntos(opcoesDe('impediu').map((o) => o.v));
  const alcool = opcoesDe('alcool').map((o) => o.v);
  const dieta = [undefined, ...opcoesDe('dietaAntes').map((o) => o.v)];
  const obst = opcoesDe('obstaculo').map((o) => o.v);
  const rotina = opcoesDe('rotina').map((o) => o.v);
  let n = 0;
  for (const habitos of combosHab)
    for (const impediu of combosImp)
      for (const a of alcool)
        for (const d of dieta)
          for (const o of obst)
            for (const ro of rotina)
              for (const jaTentou of [['abdominal'], ['dieta']]) {
                conferirTravas({ habitos, impediu, alcool: a, dietaAntes: d, obstaculo: o, rotina: ro, jaTentou, refeicoes: '4' });
                n += 1;
              }
  console.log(`     ${n.toLocaleString('pt-BR')} combinações`);
});

caso('caminhos aleatórios pelo roteiro inteiro (com idas e voltas)', () => {
  const total = Number(process.env.CAMINHOS ?? 20000);
  const principais = new Map();
  for (let n = 0; n < total; n++) {
    const { r } = caminhar();
    try {
      conferirSemOcultas(r);
      const ts = conferirTravas(r);
      principais.set(ts[0]?.id ?? '(capa)', (principais.get(ts[0]?.id ?? '(capa)') ?? 0) + 1);
      const v = validarCorpoQuiz(montarPayload(r, { utm_source: 'ig' }));
      assert.ok(v.ok, `payload recusado: ${v.ok ? '' : v.motivo}`);
      assert.deepEqual(v.descartados, [], `validação descartou ${v.descartados}`);
      const app = cadastroDoApp(r, {});
      assert.ok(['lose', 'maintain', 'gain'].includes(app.goal), `goal ${app.goal}`);
      const p = projecao(r);
      assert.ok(p && p.semanas.every((s) => Number.isFinite(s.peso)), 'projeção inválida');
      const c = chegadaNaMeta(r);
      if (c) assert.ok(c.semanas > 0 && !LIXO.test(c.texto + c.quando), `chegada ${JSON.stringify(c)}`);
      const e = emailPlano(r, { confirmar: null, sair: 'https://exemplo/sair' });
      assert.ok(!LIXO.test(e.assunto + e.texto), `e-mail com lixo: ${e.texto.slice(0, 200)}`);
      const l = emailLembrete(1, r, 'https://exemplo/sair');
      assert.ok(!LIXO.test(l.texto), 'lembrete com lixo');
    } catch (err) {
      err.message += `\n     respostas: ${JSON.stringify(r)}`;
      throw err;
    }
  }
  const resumo = [...principais].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${Math.round((v / total) * 100)}%`);
  console.log(`     ${total.toLocaleString('pt-BR')} caminhos · trava principal: ${resumo.join(', ')}`);
});

caso('desconto do quiz: R$ 127 riscado contra R$ 64 = 50%; a página de vendas segue com R$ 299', () => {
  assert.equal(textosResultado.oferta.precoDe, 'R$127');
  assert.equal(PRECO_REFERENCIA_CENTAVOS, 12700);
  assert.equal(descontoPercentual(6400), 50);
  assert.equal(descontoPercentual(12700), 0);
  assert.equal(ofertaV2.card.precoDe, 'R$299');
});

caso('subdomínio do quiz: venda e eventos contam como do quiz, não da home', () => {
  assert.equal(caminhoDaPagina('quiz.abdomeninsano.com.br', '/'), '/quiz');
  assert.equal(caminhoDaPagina('QUIZ.abdomeninsano.com.br', ''), '/quiz');
  assert.equal(caminhoDaPagina('www.abdomeninsano.com.br', '/'), '/');
  assert.equal(caminhoDaPagina('www.abdomeninsano.com.br', '/quiz'), '/quiz');
  assert.equal(caminhoDaPagina('quiz.abdomeninsano.com.br', '/obrigado'), '/obrigado');
  const sck = sckDaCompra(caminhoDaPagina('quiz.abdomeninsano.com.br', '/'), 'quiz-oferta');
  assert.equal(sck, 'quiz__quiz-oferta');
  assert.equal(urlDaPaginaDoSck(sck, 'https://www.abdomeninsano.com.br'), 'https://www.abdomeninsano.com.br/quiz');
});

caso('pós-compra: do subdomínio do quiz o comprador volta ao funil do site principal', () => {
  assert.equal(origemDoFunil('https://quiz.abdomeninsano.com.br'), 'https://www.abdomeninsano.com.br');
  assert.equal(origemDoFunil('https://www.abdomeninsano.com.br'), 'https://www.abdomeninsano.com.br');
  assert.equal(origemDoFunil('http://localhost:3000'), 'http://localhost:3000');
});

caso('API de Conversões: a URL de origem do servidor é a mesma do navegador', () => {
  const padrao = 'https://www.abdomeninsano.com.br';
  assert.equal(baseDaOrigem('https://quiz.abdomeninsano.com.br', padrao), 'https://quiz.abdomeninsano.com.br');
  assert.equal(baseDaOrigem('https://www.abdomeninsano.com.br', padrao), padrao);
  assert.equal(baseDaOrigem('https://xabdomeninsano.com.br', padrao), padrao);
  assert.equal(baseDaOrigem('https://abdomeninsano.com.br.evil.com', padrao), padrao);
  assert.equal(baseDaOrigem('http://quiz.abdomeninsano.com.br', padrao), padrao);
  assert.equal(baseDaOrigem(null, padrao), padrao);
  assert.equal(baseDaOrigem('lixo', padrao), padrao);
});

if (falhas) {
  console.error(`\n${falhas} caso(s) falharam`);
  process.exit(1);
}
console.log('\ntudo certo');
