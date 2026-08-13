/**
 * Toda a copy do Desafio Abdômen Insano vive aqui.
 *
 * Regra: nenhum texto de venda dentro de componente. Trocar uma pergunta do FAQ,
 * um bônus ou o preço é editar UMA linha neste arquivo — o markup não se toca.
 */

export type Pilar = {
  numero: string;
  titulo: string;
  paragrafos: string[];
  aviso?: { rotulo: string; texto: string };
};

export type Semana = { rotulo: string; titulo: string };
export type Beneficio = { titulo: string; texto: string };
export type Bonus = { titulo: string; texto: string; largo?: boolean };
export type Caso = {
  arquivo: string;
  alt: string;
  legenda: string;
  width: number;
  height: number;
};
export type Pergunta = { pergunta: string; resposta: string };
export type Selo = { rotulo: string; valor: string };

export const marca = {
  nome: 'Desafio Abdômen Insano',
  titulo: 'Desafio Abdômen Insano — 42 dias para o abdômen trincado',
  descricao:
    'Em 42 dias você elimina a gordura chata do abdômen e conquista os gomos definidos. Treino avançado, alimentação simplificada e cardio calculado, tudo dentro do app. Por R$42.',
  logo: '/img/logo-desafio.png',
} as const;

export const oferta = {
  precoNumero: 42,
  precoMoeda: 'BRL',
  precoRotulo: 'R$',
  precoDia: 'Por apenas 1 real por dia',
  precoNota: 'Pagamento único · acesso por 1 ano',
  checkoutUrl: 'https://pay.cakto.com.br/jegvaw9_1000225',
  ctaTexto: 'Aceito o desafio',
  provocacao: 'Você aceita o desafio?',
  intro:
    'Na boa? Eu poderia cobrar caro por esse desafio, porque ele funciona. Mas não vou cobrar caro. Você vai botar o abdômen trincado e sentir a autoconfiança dos deuses.',
  fecho:
    'São apenas 42 reais pra você trincar a barriga e mudar completamente sua vida. Vamos destravar uma vida épica, estética, equilibrada e livre.',
} as const;

export const selos: Selo[] = [
  { rotulo: 'Compra', valor: '100% segura' },
  { rotulo: 'Acesso', valor: 'por 1 ano' },
  { rotulo: 'Garantia', valor: 'incondicional de 7 dias' },
];

export const hero = {
  eyebrow: '42 dias · dentro do app',
  tituloAntes: 'Conquiste o abdômen ',
  tituloDestaque: 'trincado, estético e seco',
  subAntes: 'Em 42 dias seus amigos não vão entender nada. Você vai eliminar ',
  subDestaque: 'essa gordura chata do abdômen',
  subDepois: ', conquistar os gomos definidos e uma postura de respeito.',
  provocacaoAntes: 'Você aceita ',
  provocacaoDestaque: 'o desafio?',
  numeros: [
    { valor: '+5.500', rotulo: 'alunos no desafio' },
    { valor: '42', rotulo: 'dias de protocolo' },
    { valor: '1', rotulo: 'ano de acesso' },
  ],
  malhaCabecalho: { esquerda: 'Malha do desafio', direita: '06 semanas' },
  malhaRodape:
    'Cada quadrado é um dia marcado no app. O último é o dia em que ninguém te reconhece.',
} as const;

export const metodo = {
  eyebrow: 'O método',
  titulo: 'Como funciona essa parada?',
  lead: 'Eu e meu time montamos um planejamento à prova de falhas. Em 42 dias, basta cumprir o planejamento para conquistar o abdômen insano.',
} as const;

export const pilares: Pilar[] = [
  {
    numero: '01 — TREINO',
    titulo: 'Treino avançado',
    paragrafos: [
      'Você recebe uma trilha de treinos progressivos semana a semana, direto no aplicativo.',
    ],
    aviso: {
      rotulo: 'Acredite',
      texto:
        'Não adianta apenas treinar. É preciso intensificar os exercícios seguindo uma estratégia eficiente e validada.',
    },
  },
  {
    numero: '02 — ALIMENTAÇÃO',
    titulo: 'Alimentação simplificada',
    paragrafos: [
      'Cansei de ver gente dificultando essa parte tão simples. Você recebe um protocolo criado por uma nutricionista experiente para aprender a comer certo sem virar escravo de dieta rigorosa.',
    ],
  },
  {
    numero: '03 — CARDIO',
    titulo: 'O elemento fundamental',
    paragrafos: [
      'Você vai acelerar a queima de gordura de forma consistente e saudável. Quando você une a tríade — treino avançado, alimentação simplificada e um cardio estratégico e calculado — o abdômen insano deixa de ser sonho distante.',
    ],
  },
];

export const semanas: Semana[] = [
  { rotulo: 'SEMANA 01', titulo: 'Preparando o abdômen' },
  { rotulo: 'SEMANA 02', titulo: 'Aumentando a resistência' },
  { rotulo: 'SEMANA 03', titulo: 'Fortalecendo de dentro pra fora' },
  { rotulo: 'SEMANA 04', titulo: 'Colando a pele no músculo' },
  { rotulo: 'SEMANA 05', titulo: 'Lapidando a definição' },
  { rotulo: 'SEMANA 06', titulo: 'Abdômen insano' },
];

export const inspira = {
  citacaoAntes: 'Não importa se você está ',
  citacaoDestaque: 'longe do objetivo',
  corpo:
    'A partir de hoje você não está mais sozinho. Eu e você vamos correr juntos atrás de uma única missão: construir o abdômen mais insano da sua vida.',
} as const;

export const depoimentos = {
  eyebrow: 'Resultados reais',
  tituloLinhas: ['Tá todo mundo botando', 'o abdômen insano'],
  lead: 'Você é o próximo. Mais de 5.500 alunos já estão dentro do desafio.',
  provocacaoAntes: 'Quero botar ',
  provocacaoDestaque: 'o abdômen insano',
} as const;

const caso = (n: number, feminino: boolean, height: number): Caso => {
  const id = String(n).padStart(2, '0');
  const artigo = feminino ? 'Aluna' : 'Aluno';
  return {
    arquivo: `/img/caso-${id}.jpg`,
    alt: `${artigo} do desafio antes e depois`,
    legenda: `${artigo} do desafio`,
    width: 900,
    height,
  };
};

export const casos: Caso[] = [
  caso(1, false, 900),
  caso(2, false, 900),
  caso(3, false, 900),
  caso(4, false, 726),
  caso(5, false, 900),
  caso(6, false, 900),
  caso(7, true, 841),
  caso(8, false, 900),
  caso(9, false, 900),
  caso(10, true, 841),
];

export const beneficiosSecao = {
  eyebrow: 'Muito além do espelho',
  tituloLinhas: ['Por que um abdômen', 'insano é essencial?'],
  lead: 'Além da estética, um abdômen forte traz benefícios que vão muito além de se sentir melhor se olhando no espelho.',
} as const;

export const beneficios: Beneficio[] = [
  {
    titulo: 'Mais força',
    texto:
      'O abdômen é responsável pela sustentação e pelo equilíbrio do seu corpo. Quando ele fica mais forte, você progride mais carga, sustenta melhores execuções e o corpo todo fica mais estético.',
  },
  {
    titulo: 'Estabilidade',
    texto:
      'Um core fortalecido te dá mais equilíbrio. Quer progredir melhor as cargas? Comece pelo abdômen. Quer pedalar melhor? Comece pelo abdômen. Quer correr melhor? Agora você já sabe a resposta.',
  },
  {
    titulo: 'Postura melhorada',
    texto:
      'Quem tem abdômen forte mantém a postura ereta naturalmente. Isso evita dores nas costas, te faz ser mais respeitado e transmite muito mais confiança para as pessoas ao seu redor.',
  },
  {
    titulo: 'Confiança e performance',
    texto:
      'Essa é a etapa que você vive quando vê o resultado no seu próprio corpo. Sua confiança aumenta e seu desempenho nos treinos vai para outro nível.',
  },
];

export const entregaveisSecao = {
  eyebrow: 'O que você recebe',
  titulo: 'Depois dos 42 dias, ninguém vai te reconhecer',
  lead: 'A galera vai te respeitar muito mais, você vira referência pros seus amigos. Acredite: o abdômen insano muda tudo.',
} as const;

export const entregaveis: string[] = [
  'Aplicativo exclusivo',
  'Trilha de treinos',
  'Cardápios simplificados para dieta',
  'O elemento fundamental',
  'Grupo VIP no WhatsApp',
];

export const bonusSecao = {
  eyebrow: 'Fora tudo isso',
  tituloLinhas: ['Ainda preparei uns', 'bônus surreais pra você'],
} as const;

export const bonus: Bonus[] = [
  {
    titulo: 'Protocolo de sono e recuperação dos atletas',
    texto:
      'Os hábitos sagrados de sono e recuperação dos maiores atletas da atualidade, entre eles CR7, LeBron James e Djokovic.',
  },
  {
    titulo: 'Guia “Sobrevivência Social”',
    texto:
      'O script exato pra ir no happy hour, no churrasco e no rodízio e mesmo assim continuar dentro do seu déficit, sem sacrificar a vida social.',
  },
  {
    titulo: 'Treinos dos fisiculturistas naturais',
    texto:
      'Treinos de musculação dos melhores fisiculturistas naturais do mundo, com vídeos de execução.',
  },
  {
    titulo: 'Rede social do desafio',
    texto:
      'Dentro do app existe uma área própria pra tirar dúvidas, postar suas evoluções, trocar aquela ideia maneira e muito mais.',
  },
  {
    titulo: '1 ano de acesso',
    texto:
      '42 dias de desafio + 11 meses de bônus. Você entra pra fazer 42 dias e fica um ano inteiro com tudo na mão.',
    largo: true,
  },
];

export const expert = {
  eyebrow: 'Quem está do seu lado',
  tituloLinhas: ['O idealizador do', 'Desafio Abdômen Insano'],
  antesTitulo: 'ANTES',
  antes: ['Zuado pela magreza', 'Fraco mentalmente', 'Preguiçoso'],
  hojeTitulo: 'HOJE',
  hoje: ['Corpo forte e estético', 'Referência de shape pra milhares', 'Produtivo e focado'],
  historia: [
    'Eu me chamo Igor Correa. Sempre fui sacaneado por colegas de clube, de escola e até no trabalho por ser magro demais, preguiçoso e sem comprometimento.',
    'Eu nunca gostei de ouvir essas palavras, e mesmo com todas as minhas dificuldades eu sempre soube que isso não fazia parte da minha identidade. Não era quem eu sabia que seria.',
    'Essas críticas me levaram a tomar as ações que mudaram a minha vida para sempre: entrei na academia, comecei a levar os estudos em nutrição e educação física a sério e desenvolvi uma mentalidade mais organizada e blindada.',
    'Hoje eu crio conteúdo exatamente sobre o que mais estudei e impacto todos os meses mais de 1 milhão de pessoas a saírem da inércia, buscarem o seu melhor físico e a vida que merecem viver.',
    'O Desafio Abdômen Insano de 42 dias foi idealizado pra que você dê o primeiro passo e sinta os primeiros resultados de uma vida incrível, através da mudança de pequenas ações no seu dia a dia.',
    'Eu acredito, de verdade, que você pode ser mais forte, mais focado e viver a vida dos seus sonhos.',
  ],
  assinatura: 'Igor Correa',
  assinaturaCargo: 'Idealizador do Desafio Abdômen Insano',
  fotoAntes: '/img/igor-antes.jpg',
  fotoHoje: '/img/igor-hoje.jpg',
} as const;

export const faqSecao = {
  eyebrow: 'Tira-dúvidas',
  titulo: 'Perguntas frequentes',
} as const;

export const faq: Pergunta[] = [
  {
    pergunta: 'Para quem é o Desafio Abdômen Insano?',
    resposta:
      'Para homens e mulheres que buscam resultados rápidos e duradouros em emagrecimento e definição abdominal.',
  },
  {
    pergunta: 'Sou gordão. Vou obter resultado em 42 dias?',
    resposta:
      'Só jogo com a verdade: se você estiver muito acima do peso, vai precisar seguir o desafio por um tempo a mais. Mas relaxa, você vai se assustar. Basta seguir o plano de treinos e alimentação para alcançar o abdômen insano em pouco tempo.',
  },
  {
    pergunta: 'Eu sou o “falso magro”. Esse desafio serve pra mim?',
    resposta:
      'Sim. O Desafio Abdômen Insano foi bem desenhado pra esse público que sofre com um corpo magro de camisa, mas que sempre tem uma gordurinha ali nos flancos e no próprio abdômen.',
  },
  {
    pergunta:
      'Já fiz dieta e emagreci o rosto e os braços, mas a barriga não saiu. Por que dessa vez seria diferente?',
    resposta:
      'Porque dieta genérica emagrece o corpo todo, mas não ataca especificamente a gordura que blinda seu abdômen. O protocolo sincroniza as três alavancas certas: ativação de core, queima calculada e déficit sob medida. A ideia não é só reduzir peso no geral, é construir músculo de verdade.',
  },
  {
    pergunta: 'Já treino na academia. Preciso mudar meu treino todo?',
    resposta:
      'Não, você não precisa abandonar o treino de musculação que já tem. Você só precisa seguir a parte do desafio de abdômen depois do seu treino: cardápio, especificidade pro abdômen e os cardios calculados.',
  },
  {
    pergunta: 'Não tenho tempo pra academia todo dia. Dá pra fazer com menos frequência?',
    resposta:
      'Sim. Dá pra ter resultado real fazendo o treino de abdômen e o cardio calculado apenas 2x na semana. O desafio foi feito pra funcionar mesmo com rotina corrida — o que importa é a consistência, não a quantidade de dias.',
  },
  {
    pergunta:
      'Não sou disciplinado. Já comecei várias coisas e não terminei. Como sei que vou concluir esse?',
    resposta:
      'O app foi feito pra quem já falhou sozinho antes. É gamificado, tem a comunidade Antifalhas te puxando nos dias difíceis e progresso visível semana a semana. Você não depende só da sua força de vontade: o sistema não te deixa desistir.',
  },
  {
    pergunta: 'Vou precisar comprar suplemento ou algo a mais pra funcionar?',
    resposta:
      'Não. Tudo que você precisa pra conquistar o abdômen insano já está dentro do app. Zero investimento extra.',
  },
  {
    pergunta: 'Definição abdominal não depende de genética?',
    resposta:
      'A genética facilita, mas não decide sozinha. O que realmente define o abdômen é acionar as alavancas certas: ativação de core, queima calculada e déficit sob medida. Quando a metodologia é bem feita, a grande maioria consegue um ótimo resultado.',
  },
  {
    pergunta: 'O déficit calórico vai me deixar sem energia ou fraco no treino?',
    resposta:
      'Não. Existe uma pequena queda natural de energia por conta do déficit, mas nada exagerado ou que atrapalhe seu dia. Você continua treinando bem e vendo excelentes resultados ao longo dos 42 dias.',
  },
  {
    pergunta: '42 dias é pouco tempo. O resultado não vai sumir depois?',
    resposta:
      'Não necessariamente. O desafio é o ponto de partida perfeito pra você conquistar os hábitos certos, construir um corpo mais forte e, depois dos 42 dias, sustentar o resultado que conquistou.',
  },
  {
    pergunta: 'Eu saio com amigos nos finais de semana. Isso vai atrapalhar o resultado?',
    resposta:
      'Sendo sincero? Depende de como você lida com isso. Por isso o Guia Sobrevivência Social está incluso no desafio. Ele te dá o script exato pra sair, aproveitar e continuar dentro do seu déficit, sem sacrificar sua vida social nem seu progresso.',
  },
];

export const suporte = {
  eyebrow: 'Suporte',
  titulo: 'Ficou alguma dúvida?',
  lead: 'Fala com a nossa equipe agora mesmo.',
  linkTexto: 'Falar com o suporte',
  /** TROQUE PELO LINK DO WHATSAPP — hoje aponta pro topo, o que é um link quebrado. */
  linkUrl: process.env.NEXT_PUBLIC_WHATSAPP_URL ?? '',
} as const;

export const rodape = {
  navegacao: [
    { rotulo: 'Contato', href: '/contato' },
    { rotulo: 'Política de Privacidade', href: '/privacidade' },
    { rotulo: 'Termos de Uso', href: '/termos' },
  ],
  responsaveis: 'Karla — CRN1 23440 · Gledson — CREF 015440-G/DF',
  empresa: '© 2026 SI TREINAMENTOS LTDA · CNPJ 62.568.265/0001-48',
  aviso:
    'Este site não é afiliado ao Facebook ou a qualquer entidade do Facebook. Resultados individuais podem variar conforme dedicação e condição física de cada pessoa.',
} as const;
