import type { Respostas, Tela } from '@/components/quiz/tipos';
import { primeiroNome } from '@/components/quiz/calculos';

/**
 * Quiz "Plano Capa Zero" (`/quiz`) — formato "quiz sem VSL", só homens.
 * Roteiro aprovado pelo Igor em 16/11/2026.
 *
 * Só promete o que a LP já promete (+5.500 alunos, 2x na semana, em casa ou
 * academia, churras e breja, Guia Fim de Semana, Comunidade Anti Falhas,
 * garantia de 15 dias). Telas marcadas "→ app" gravam o valor EXATO do
 * cadastro do app (Flammer, MotorDeCadastro.kt): não traduzir os `v`.
 */

const img = (n: string) => `/img/quiz/${n}.webp`;
const opcoes = (pares: [string, string][]) => pares.map(([v, rotulo]) => ({ v, rotulo }));

const lista = (v: unknown): string[] => (Array.isArray(v) ? v : []);
const nuncaTentou = (r: Respostas) => r.tentou === 'nunca';
const treina = (r: Respostas) => typeof r.experiencia === 'string' && r.experiencia !== 'none';
const bebe = (r: Respostas) => r.alcool === 'fds' || r.alcool === 'semana';

/** Nome do evento como a pessoa falaria ("o seu casamento"). */
export const NOME_EVENTO: Record<string, string> = {
  praia: 'o verão',
  festa: 'o grande dia',
  viagem: 'a sua viagem',
};

const textoObstaculo: Record<string, string> = {
  consistency:
    'O app é gamificado e a **Comunidade Anti Falhas** te puxa nos dias difíceis. Você não depende só da força de vontade.',
  habits:
    'Você não vai virar outra pessoa da noite pro dia. O plano encaixa na sua rotina e troca **um hábito de cada vez**.',
  time: 'Dá resultado real treinando abdômen **2x na semana**. O que importa é a constância, não a quantidade de dias.',
  motivation:
    'Você registra cada série no app e **vê a evolução semana a semana**. Progresso visível é o que mantém a motivação.',
};

export const telasQuiz: Tela[] = [
  /* ============================ BLOCO 1 — SEU CORPO ============================ */
  {
    k: 'abertura',
    bloco: 1,
    chave: 'faixaIdade',
    titulo: 'Descubra em 2 minutos o que está **escondendo o seu abdômen**',
    sub: 'Responda e receba o seu **Plano Capa Zero de 42 dias**, feito pro seu corpo e pra sua rotina.',
    pergunta: 'Pra começar: qual a sua idade?',
    img: '/img/hero-quiz-2.webp',
    opcoes: opcoes([['18-24', '18 a 24'], ['25-34', '25 a 34'], ['35-44', '35 a 44'], ['45+', '45 ou mais']]),
  },
  {
    k: 'info',
    bloco: 1,
    destaque: '+5.500',
    titulo: 'homens já entraram no Desafio Abdômen Insano',
    linhas: [
      'E a maioria começou exatamente onde você está: com o abdômen **escondido debaixo de uma capa de gordura**.',
      'Agora vamos montar o seu plano em cima do **seu corpo e da sua rotina**.',
    ],
    botao: 'Bora',
  },
  {
    k: 'cards',
    bloco: 1,
    chave: 'fisico',
    titulo: 'Como está o seu físico hoje?',
    sub: 'Escolha o mais parecido com você',
    opcoes: [
      { v: 'fina', rotulo: 'Magro com barriguinha', img: img('atual-0') },
      { v: 'media', rotulo: 'Barriga saliente', img: img('atual-1') },
      { v: 'grossa', rotulo: 'Acima do peso', img: img('atual-2') },
      { v: 'muito-grossa', rotulo: 'Bem acima do peso', img: img('atual-3') },
    ],
  },
  {
    k: 'cards',
    bloco: 1,
    chave: 'objetivo',
    titulo: 'Qual abdômen você quer?',
    opcoes: [
      { v: 'seco', rotulo: 'Seco e definido', img: img('objetivo-0') },
      { v: 'trincado', rotulo: 'Trincado', img: img('objetivo-1') },
      { v: 'atletico', rotulo: 'Atlético e trincado', img: img('objetivo-2') },
      { v: 'forte', rotulo: 'Forte e trincado', img: img('objetivo-3') },
    ],
  },
  {
    k: 'lista',
    bloco: 1,
    chave: 'gorduraLocal',
    titulo: 'Onde a gordura mais teima em ficar?',
    opcoes: opcoes([
      ['barriga', 'Na barriga'],
      ['flancos', 'Nos flancos (o pneuzinho)'],
      ['peito', 'No peito'],
      ['todo', 'No corpo todo por igual'],
    ]),
  },
  {
    k: 'lista',
    bloco: 1,
    chave: 'tipoBarriga',
    titulo: 'Como é a sua barriga hoje?',
    opcoes: opcoes([
      ['cerveja', 'Barriga de cerveja e comida'],
      ['inchada', 'Estufada, vive inchada'],
      ['mole', 'Mole, dá pra apertar'],
      ['coberta', 'Firme, mas coberta de gordura'],
    ]),
  },
  { k: 'capa', bloco: 1 },

  /* =========================== BLOCO 2 — SEU HISTÓRICO =========================== */
  {
    k: 'lista',
    bloco: 2,
    chave: 'tentou',
    titulo: 'Você já tentou definir o abdômen antes?',
    opcoes: opcoes([['varias', 'Sim, várias vezes'], ['poucas', 'Sim, uma ou duas'], ['nunca', 'Nunca tentei a sério']]),
  },
  {
    k: 'multi',
    bloco: 2,
    chave: 'jaTentou',
    quando: (r) => !nuncaTentou(r),
    titulo: 'O que você já tentou?',
    sub: 'Marque tudo que se aplica',
    opcoes: [
      { v: 'abdominal', rotulo: 'Abdominal todo dia' },
      { v: 'dieta', rotulo: 'Dieta restritiva' },
      { v: 'jejum', rotulo: 'Jejum intermitente' },
      { v: 'cardio', rotulo: 'Muito cardio' },
      { v: 'suplemento', rotulo: 'Termogênico ou suplemento' },
      { v: 'nada', rotulo: 'Nada ainda', exclusiva: true },
    ],
  },
  {
    k: 'lista',
    bloco: 2,
    chave: 'dietaAntes',
    quando: (r) => !nuncaTentou(r),
    titulo: 'Quando você fez dieta, o que aconteceu?',
    opcoes: opcoes([
      ['barriga-ficou', 'Afinei rosto e braço, mas a barriga ficou'],
      ['voltou', 'Perdi peso e voltou tudo'],
      ['fome', 'Passei fome e larguei'],
      ['nunca', 'Nunca fiz dieta'],
    ]),
  },
  {
    k: 'info',
    bloco: 2,
    titulo: 'Por que a barriga é a última a sair',
    linhas: [
      (r) =>
        r.dietaAntes === 'barriga-ficou'
          ? 'Foi exatamente o que aconteceu com você: o corpo não escolhe de onde tira a gordura, e o abdômen costuma ser **um dos últimos lugares a secar**. Por isso o rosto e o braço afinaram primeiro e a barriga ficou.'
          : 'O corpo não escolhe de onde tira a gordura, e o abdômen costuma ser **um dos últimos lugares a secar**. Por isso, quando se emagrece, o rosto e o braço afinam primeiro e a barriga fica por último.',
      (r) =>
        lista(r.jaTentou).includes('abdominal')
          ? 'E abdominal todo dia, sozinho, não queima a gordura que cobre o abdômen.'
          : '',
      'Só dieta não fecha a conta. Só abdominal também não. É preciso atacar **2 frentes ao mesmo tempo**: tirar a capa de gordura e construir o abdômen por baixo dela.',
    ],
  },

  /* ============================ BLOCO 3 — SEU TREINO ============================ */
  {
    k: 'lista', // → app: training_experience
    bloco: 3,
    chave: 'experiencia',
    titulo: 'Há quanto tempo você treina?',
    opcoes: opcoes([['none', 'Nunca treinei'], ['lt6m', 'Menos de 6 meses'], ['6m2y', 'De 6 meses a 2 anos'], ['gt2y', 'Mais de 2 anos']]),
  },
  {
    k: 'lista', // → app: workout_place
    bloco: 3,
    chave: 'local',
    titulo: 'Onde você vai fazer o desafio?',
    sub: 'O treino se adapta ao lugar',
    opcoes: opcoes([['full_gym', 'Academia completa'], ['basic_gym', 'Academia básica (prédio, condomínio)'], ['home', 'Em casa']]),
  },
  {
    k: 'lista', // → app: training_frequency
    bloco: 3,
    chave: 'frequencia',
    titulo: 'Quantos dias por semana você consegue treinar?',
    opcoes: opcoes([['0-2', 'Até 2 dias'], ['3-5', 'De 3 a 5 dias'], ['6+', '6 dias ou mais']]),
  },
  {
    k: 'info',
    bloco: 3,
    titulo: (r) => (r.frequencia === '0-2' ? 'Dá resultado com 2x na semana' : 'O que importa é a constância'),
    linhas: [
      (r) =>
        r.frequencia === '0-2'
          ? 'O desafio foi feito pra funcionar **mesmo com rotina corrida**. O que importa é a constância, não a quantidade de dias.'
          : 'Com a sua disponibilidade dá pra seguir o plano com folga. E mesmo nas semanas corridas, **2 treinos já mantêm o resultado andando**.',
      (r) =>
        !treina(r)
          ? 'Nunca treinou? Sem problema: **o treino começa no seu nível** e carga, séries e intensidade sobem semana a semana.'
          : r.local === 'home'
            ? 'O treino de abdômen é montado **pra fazer em casa**, encaixado na rotina que você já tem.'
            : 'Já treina? **Não muda nada no seu treino**: você só encaixa a parte do abdômen depois da musculação.',
    ],
  },
  {
    k: 'lista', // → app: session_time
    bloco: 3,
    chave: 'tempoTreino',
    titulo: 'Quanto tempo você tem por treino?',
    opcoes: opcoes([['30_45', '30 a 45 minutos'], ['60', 'Cerca de 1 hora'], ['90_plus', '1h30 ou mais']]),
  },
  {
    k: 'lista', // → app: cardio_preference
    bloco: 3,
    chave: 'cardio',
    titulo: 'Como você prefere fazer o cardio?',
    opcoes: opcoes([
      ['post_15', '15 minutos depois do treino'],
      ['session_30_45', 'Uma sessão de 30 a 45 minutos'],
      ['separate_days', 'Em dias separados'],
      ['none', 'Prefiro sem cardio'],
    ]),
  },

  /* ======================= BLOCO 4 — ROTINA E ALIMENTAÇÃO ======================= */
  {
    k: 'lista', // → app: daily_routine
    bloco: 4,
    chave: 'rotina',
    titulo: 'Como é o seu dia a dia?',
    opcoes: opcoes([['sedentary', 'Passo o dia sentado'], ['active', 'Me movimento bastante'], ['heavy', 'Trabalho pesado, braçal']]),
  },
  {
    k: 'lista',
    bloco: 4,
    chave: 'sono',
    titulo: 'Quantas horas você dorme por noite?',
    opcoes: opcoes([['lt5', 'Menos de 5 horas'], ['5-6', '5 a 6 horas'], ['7-8', '7 a 8 horas'], ['gt8', 'Mais de 8 horas']]),
  },
  {
    k: 'lista', // → app: meals_count (string)
    bloco: 4,
    chave: 'refeicoes',
    titulo: 'Quantas refeições você faz por dia?',
    opcoes: opcoes([['3', '3 refeições'], ['4', '4 refeições'], ['5', '5 refeições'], ['6', '6 refeições']]),
  },
  {
    k: 'multi',
    bloco: 4,
    chave: 'habitos',
    titulo: 'Você tem algum destes hábitos?',
    sub: 'Marque tudo que se aplica',
    opcoes: [
      { v: 'belisca', rotulo: 'Belisco à noite' },
      { v: 'delivery', rotulo: 'Peço muito delivery' },
      { v: 'refri', rotulo: 'Tomo refrigerante' },
      { v: 'pula', rotulo: 'Pulo refeições' },
      { v: 'doce', rotulo: 'Não resisto a doce' },
      { v: 'nenhum', rotulo: 'Nenhum desses', exclusiva: true },
    ],
  },
  {
    k: 'lista',
    bloco: 4,
    chave: 'alcool',
    titulo: 'Com que frequência você bebe?',
    opcoes: opcoes([['nunca', 'Não bebo'], ['fds', 'Só no fim de semana'], ['semana', 'Várias vezes na semana']]),
  },
  {
    k: 'info',
    bloco: 4,
    titulo: (r) => (bebe(r) ? 'Cabe o churras de domingo e a breja de qualidade' : 'Sem dieta de sofrimento'),
    linhas: [
      'O seu plano alimentar é calculado a partir do seu peso, da sua rotina e **do que você gosta de comer**.',
      (r) =>
        bebe(r)
          ? 'E o **Guia Fim de Semana Sem Culpa** te dá o script pra sair com os amigos e tomar a sua cerveja sem jogar a semana fora.'
          : lista(r.habitos).includes('delivery')
            ? 'E o **Guia Fim de Semana Sem Culpa** te mostra como encaixar o churrasco, o rodízio e o delivery sem jogar a semana fora.'
            : 'E o **Guia Fim de Semana Sem Culpa** te mostra como encaixar o churrasco e o rodízio sem jogar a semana fora.',
    ],
  },
  {
    k: 'lista', // → app: biggest_obstacle
    bloco: 4,
    chave: 'obstaculo',
    titulo: 'O que mais te travou até hoje?',
    opcoes: opcoes([
      ['consistency', 'Manter a constância'],
      ['habits', 'Os maus hábitos'],
      ['time', 'Falta de tempo'],
      ['motivation', 'Falta de motivação'],
    ]),
  },
  {
    k: 'info',
    bloco: 4,
    titulo: 'Dessa vez vai ser diferente',
    linhas: [(r: Respostas) => textoObstaculo[String(r.obstaculo)] ?? textoObstaculo.consistency],
  },
  {
    // Autoridade (ideia do quiz do Cariani): quem conduz o desafio. Só fatos
    // que já estão na página de vendas (expertV2 em lp-v2.ts).
    k: 'info',
    bloco: 4,
    titulo: 'Quem vai conduzir os seus 42 dias',
    img: '/img/igor-hoje.webp',
    imgPosicao: '50% 22%',
    linhas: [
      'Eu sou o **Igor Correa**. Passei a vida sendo zoado por ser magro demais, até levar a sério a academia e os estudos de **nutrição e educação física**.',
      'Hoje eu impacto **mais de 1 milhão de pessoas por mês** nas redes, e criei o Desafio Abdômen Insano pra você dar o primeiro passo com um plano de verdade.',
    ],
  },

  /* ============================ BLOCO 5 — SEUS NÚMEROS ============================ */
  {
    k: 'numero',
    bloco: 5,
    chave: 'altura',
    titulo: 'Qual é a sua altura?',
    unidade: 'cm',
    min: 120,
    max: 220,
    inicial: 175,
  },
  {
    k: 'numero',
    bloco: 5,
    chave: 'peso',
    titulo: 'Qual é o seu peso atual?',
    unidade: 'kg',
    min: 35,
    max: 200,
    inicial: 85,
  },
  {
    k: 'numero',
    bloco: 5,
    chave: 'pesoDesejado',
    titulo: 'E qual peso você quer atingir?',
    sub: 'Não tem certeza? Coloque um valor aproximado',
    unidade: 'kg',
    min: 35,
    max: 200,
    inicial: 78,
    validar: (v, r) => {
      const a = typeof r.altura === 'number' ? r.altura / 100 : null;
      if (a && v / (a * a) < 18.5) return 'Esse peso fica abaixo do saudável pra sua altura. Escolha um valor maior.';
      return null;
    },
  },
  {
    k: 'nascimento',
    bloco: 5,
    chave: 'nascimento',
    titulo: 'Qual a sua data de nascimento?',
    sub: 'O seu metabolismo muda com a idade, e o plano leva isso em conta',
    idadeMinima: 18,
  },
  {
    k: 'lista',
    bloco: 5,
    chave: 'evento',
    titulo: 'Tem alguma data importante pela frente?',
    opcoes: opcoes([['praia', 'Praia ou verão'], ['festa', 'Casamento ou festa'], ['viagem', 'Viagem'], ['nenhum', 'Não, só quero mudar']]),
  },
  {
    k: 'dataEvento',
    bloco: 5,
    chave: 'dataEvento',
    quando: (r) => typeof r.evento === 'string' && r.evento !== 'nenhum',
    titulo: (r) => `Quando é ${NOME_EVENTO[String(r.evento)] ?? 'a data'}?`,
    sub: 'Vamos calcular até onde dá pra chegar até lá',
    maxDias: 730,
  },
  {
    k: 'lista', // → app: aspiration
    bloco: 5,
    chave: 'aspiracao',
    titulo: 'O que você mais quer com o desafio?',
    opcoes: opcoes([
      ['body', 'Ter o corpo que eu quero'],
      ['healthy', 'Mais saúde'],
      ['energy', 'Mais energia no dia a dia'],
      ['motivation', 'Virar um cara mais disciplinado'],
    ]),
  },

  /* ============================== BLOCO 6 — SEU PLANO ============================== */
  {
    k: 'carregando',
    bloco: 6,
    titulo: 'Montando o seu Plano Capa Zero…',
    etapas: [
      'Analisando o seu corpo',
      'Calculando a sua capa de gordura',
      'Ajustando o treino ao seu local e tempo',
      'Encaixando a alimentação na sua rotina',
      'Projetando os seus 42 dias',
    ],
  },
  {
    k: 'email',
    bloco: 6,
    titulo: 'O seu plano está pronto!',
    sub: 'Pra onde mandamos o seu **Plano Capa Zero**?',
    aviso:
      'Use este mesmo e-mail na compra: é com ele que você entra no app e o seu plano já chega montado.',
  },
  { k: 'diagnostico', bloco: 6 },
  { k: 'plano', bloco: 6 },
  { k: 'oferta', bloco: 6 },
];

/** Textos da tela "capa" (bloco 1), por nível. */
export const textosCapa = {
  titulo: 'A sua capa de gordura é',
  niveis: {
    fina: {
      rotulo: 'FINA',
      texto: 'Os gomos já estão aí, só falta tirar a última camada. Com o déficit certo e o abdômen treinado, **eles aparecem rápido**.',
    },
    media: {
      rotulo: 'MÉDIA',
      texto: 'O seu abdômen já existe, ele só está **escondido**. Tirando a capa e construindo o músculo ao mesmo tempo, ele aparece.',
    },
    grossa: {
      rotulo: 'GROSSA',
      texto: 'A capa é a prioridade agora. O plano começa **tirando a gordura** e construindo o abdômen por baixo dela, pra ele aparecer conforme a capa sai.',
    },
    'muito-grossa': {
      rotulo: 'MUITO GROSSA',
      texto: 'Nada de pressa errada: o plano foca em **tirar a capa com constância**, sem passar fome, e já vai construindo o abdômen que vai aparecer depois.',
    },
  },
  nota: 'Estimativa a partir das suas respostas. Não substitui uma avaliação profissional.',
} as const;

/** Textos fixos do resultado, do plano e da oferta. */
export const textosResultado = {
  diagnostico: {
    titulo: (r: Respostas) => `${primeiroNome(r) || 'Pronto'}, esse é o seu diagnóstico`,
    projecaoTitulo: 'A sua projeção nos 42 dias',
    projecaoNota:
      'Estimativa conservadora a partir do seu peso e da sua capa. Resultados variam de pessoa pra pessoa.',
  },
  plano: {
    titulo: 'O seu Plano Capa Zero',
    sub: 'As 3 engrenagens rodando juntas por 42 dias, ajustadas pra você:',
  },
  oferta: {
    titulo: 'Comece o seu desafio hoje',
    lembreteEmail: 'Na compra, use o e-mail',
  },
} as const;
