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
  /** Foto do topo do card (opcional; sem ela renderiza um degradê quente). */
  foto?: { src: string; alt: string };
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
  logo: '/img/logo-desafio.svg',
} as const;

export const oferta = {
  precoNumero: 42,
  precoMoeda: 'BRL',
  precoRotulo: 'R$',
  precoDia: 'Por apenas R$1/dia',
  checkoutUrl: 'https://pay.cakto.com.br/jegvaw9_1000225',
  ctaTexto: 'Aceito o desafio!',
  provocacao: 'Aceita o desafio?',
  /** Hierarquia da narrativa (referência página modelo): pergunta pequena
   *  com destaques laranja → headline gigante com final em laranja →
   *  chamada uppercase → parágrafos plain. Cada campo mapeia direto pra
   *  um bloco na Oferta.tsx. */
  perguntaAntes: 'E na boa?',
  perguntaMeio: ' Eu poderia cobrar caro por esse desafio, porque ele funciona! ',
  perguntaDepois: 'Mas não vou cobrar caro.',
  promessaAntes: 'Você vai botar o abdômen trincado e ',
  promessaDestaque: 'sentir a autoconfiança dos deuses…',
  destaque: 'Por apenas 1 real por dia.',
  reforco: 'Sim, isso mesmo! Por tempo limitado, o Desafio Abdômen Insano custa apenas R$42.',
  fecho: 'São apenas 42 reais pra você trincar a barriga e mudar completamente sua vida.',
  fechoDestaque: 'Vamos destravar uma vida épica, estética, equilibrada e livre.',
  tempoLimitado: 'Oferta por tempo limitado.',
} as const;

/**
 * Selos de garantia embaixo do card da Oferta — mesma tríade do print.
 * Cada um vira uma coluna com ícone laranja + texto centralizado.
 */
export const ofertaGarantias = [
  { icone: 'compra', titulo: 'Compra 100% segura', linha: 'via Cakto' },
  { icone: 'acesso', titulo: 'Acesso por 1 ano', linha: 'ao desafio dentro do app' },
  { icone: 'garantia', titulo: 'Garantia incondicional', linha: 'de 7 dias' },
] as const;

/**
 * Único CTA da página vive na seção Oferta. Copy vem do print da página
 * modelo (Ícaro/Igor) — verbo forte no comando: "quero botar".
 */
export const ctas = {
  oferta: 'Quero botar o abdômen insano',
} as const;

/**
 * Microcopy antifricção — aparece embaixo dos CTAs principais.
 * Reduz objeção antes do clique (garantia + acesso + preço).
 */
export const microCta = 'Garantia de 7 dias · acesso imediato · pagamento único';

/**
 * Strip de números destacados embaixo do CTA da Oferta — mesma estrutura
 * do print da página modelo: valor gigante em cima, legenda mono embaixo.
 */
export const selos: Selo[] = [
  { rotulo: '+5.500', valor: 'alunos no desafio' },
  { rotulo: '42', valor: 'dias de protocolo' },
  { rotulo: '1', valor: 'ano de acesso' },
];

export const hero = {
  /** Uma entrada por linha do cartaz. Copy oficial: convite pro VSL + promessa
   *  em 42 dias, com destaque cromático nas duas últimas linhas ("abdômen
   *  trincado, estético e seco em 42 dias") via classesLinha. */
  tituloLinhas: [
    'Conquiste',
    'um abdômen trincado,',
    'estético e seco',
    'com o desafio abdômen insano.',
  ],
  subAntes: 'Em 42 dias seus amigos não vão entender nada. Você vai eliminar ',
  subDestaque: 'essa gordura chata do abdômen',
  subDepois: ', conquistar os gomos definidos e uma postura de respeito!',
  provocacaoAntes: 'Aceita ',
  provocacaoDestaque: 'o desafio?',
} as const;

export const metodo = {
  titulo: 'Como funciona essa parada?',
  lead: 'Eu e meu time montamos um planejamento a prova de falhas. Em 42 dias basta cumprir o planejamento para conquistar o abdômen insano.',
} as const;

export const pilares: Pilar[] = [
  {
    numero: '01',
    titulo: 'Treino Avançado',
    paragrafos: [
      'Você vai receber uma trilha de treinos progressivos semana a semana, direto no aplicativo.',
    ],
    aviso: {
      rotulo: 'Acredite',
      texto:
        'Não adianta apenas treinar, é preciso intensificar os exercícios, seguindo uma estratégia eficiente e validada.',
    },
    foto: { src: '/img/metodo-01.jpg', alt: 'Homem fazendo elevação de pernas suspensa (abdominal) na academia' },
  },
  {
    numero: '02',
    titulo: 'Alimentação Simplificada',
    paragrafos: [
      'Cansei de ver gente dificultando essa parte tão simples. Você vai ter um protocolo criado por uma nutricionista experiente para aprender a comer certo sem precisar virar escravo de dietas rigorosas.',
    ],
    foto: { src: '/img/metodo-02.jpg', alt: 'Meal prep com ovos, bacon, abacate e verduras' },
  },
  {
    numero: '03',
    titulo: 'O Elemento Fundamental',
    paragrafos: [
      'Você vai derreter até 3x mais gordura de forma rápida e saudável. Quando você une a tríade: treino avançado, alimentação simplificada e um cardio estratégico e calculado, o abdômen insano não é mais um sonho distante, é uma realidade!',
    ],
    foto: { src: '/img/metodo-03.jpg', alt: 'Corredor em explosão de largada em pista de atletismo' },
  },
];

export const semanas: Semana[] = [
  { rotulo: 'Semana 01', titulo: 'Preparando o abdômen' },
  { rotulo: 'Semana 02', titulo: 'Aumentando a resistência' },
  { rotulo: 'Semana 03', titulo: 'Fortalecendo de dentro pra fora' },
  { rotulo: 'Semana 04', titulo: 'Colando a pele no músculo' },
  { rotulo: 'Semana 05', titulo: 'Lapidando a definição' },
  { rotulo: 'Semana 06', titulo: 'Abdômen insano' },
];

export const inspira = {
  citacaoAntes: 'Não importa se você está ',
  citacaoDestaque: 'longe do objetivo.',
  corpo:
    'A partir de hoje, você não está mais sozinho! Eu e você vamos correr juntos atrás de uma única missão: construir o abdômen mais insano da sua vida!',
} as const;

export const depoimentos = {
  tituloLinhas: ['Tá todo mundo botando', 'o abdômen insano!'],
  lead: 'Você é o próximo!',
  provocacaoAntes: 'Quero botar ',
  provocacaoDestaque: 'o abdômen insano!',
} as const;

const caso = (n: number, feminino: boolean): Caso => {
  const id = String(n).padStart(2, '0');
  const artigo = feminino ? 'Aluna' : 'Aluno';
  return {
    arquivo: `/img/caso-${id}.webp`,
    alt: `${artigo} do desafio antes e depois`,
    legenda: `${artigo} do desafio`,
    width: 1000,
    height: 1000,
  };
};

export const casos: Caso[] = [
  caso(1, false),
  {
    arquivo: '/img/caso-02.png',
    alt: 'Aluno do desafio antes e depois',
    legenda: 'Aluno do desafio',
    width: 1000,
    height: 1000,
  },
  caso(3, false),
  caso(4, false),
  caso(5, false),
  caso(6, false),
  caso(7, false),
  caso(8, false),
  caso(9, false),
];

export const beneficiosSecao = {
  tituloLinhas: ['Por que um abdômen', 'insano é essencial?'],
  lead: 'Além da estética, um abdômen forte traz benefícios que vão muito além de só se sentir melhor se olhando no espelho:',
} as const;

export const beneficios: Beneficio[] = [
  {
    titulo: 'Mais força',
    texto:
      'O abdômen é o responsável pela sustentação e equilíbrio do seu corpo. Quando seu abdômen se torna mais forte, você progride mais cargas, sustenta mais força com melhores execuções e obviamente se torna muito mais estético e bonito.',
  },
  {
    titulo: 'Estabilidade',
    texto:
      'Um core fortalecido te dá mais equilíbrio. Quer ficar mais forte e progredir melhor as cargas? Comece fortalecendo o abdômen. Quer pedalar melhor? Comece fortalecendo o abdômen. Quer correr melhor? Agora você já sabe a resposta.',
  },
  {
    titulo: 'Postura Melhorada',
    texto:
      'Quem tem um abdômen forte mantém a postura ereta naturalmente. Isso evita dores nas costas, te faz ser muito mais respeitado e transmite muito mais confiança para as pessoas ao seu redor.',
  },
  {
    titulo: 'Confiança e Performance',
    texto:
      'Essa é a etapa que você vive quando vê os resultados de um abdômen insano no seu corpo. Sua confiança aumenta e seu desempenho nos treinos vão para outro nível!',
  },
];

export const entregaveisSecao = {
  tituloLinhas: ['Depois dos primeiros 42 dias no desafio,', 'ninguém vai te reconhecer!'],
  lead: 'A galera vai te respeitar muito mais, tu vai se tornar referência pros seus amigos, acredite: o abdômen insano muda tudo.',
  intro: 'Ao garantir sua vaga no desafio Abdômen Insano você recebe:',
} as const;

export const entregaveis: string[] = [
  'Aplicativo Exclusivo',
  'Trilha de Treinos',
  'Cardápios Simplificados para Dieta',
  'O Elemento Fundamental',
  'Comunidade vip no app',
];

export const bonusSecao = {
  titulo: 'Fora tudo isso, ainda preparei uns bônus surreais pra você:',
  destaque: 'bônus',
} as const;

export const bonus: Bonus[] = [
  {
    titulo: 'Protocolo de Sono e Recuperação dos Atletas',
    texto:
      'Você vai aprender os hábitos sagrados de sono e recuperação dos maiores atletas da atualidade, entre eles estão CR7, LeBron James e Djokovic.',
  },
  {
    titulo: 'Guia “Sobrevivência Social”',
    texto:
      'Esse guia te dá o script exato pra ir no happy hour, no churrasco, no rodízio e mesmo assim continuar dentro do seu déficit sem sacrificar a vida social.',
  },
  {
    titulo: 'Treinos de musculação dos maiores fisiculturistas naturais',
    texto:
      'Treinos dos melhores fisiculturistas naturais do mundo, com vídeos de execução.',
  },
  {
    titulo: '1 ano de acesso',
    texto: '42 dias de desafio + 11 meses de bônus.',
  },
  {
    titulo: 'Rede Social do Desafio',
    texto:
      'No aplicativo do desafio tem uma área própria para tirar dúvidas, postar suas evoluções, trocar aquela ideia maneira e muito mais.',
    largo: true,
  },
];

export const expert = {
  /** Título com destaque laranja na palavra depois do span. */
  tituloAntes: 'Conheça o ',
  tituloDestaque: 'idealizador do método',
  antesTitulo: 'De um lado:',
  antes: ['Zuado pela magreza', 'Fraco mentalmente', 'Preguiçoso'],
  hojeTitulo: 'Do outro:',
  hoje: ['Corpo forte e estético', 'Referência de shape p/ milhares de pessoas', 'Produtivo e focado'],
  /**
   * Introdução do relato — o nome vem em negrito, seguido de vírgula.
   * O restante da história continua nos parágrafos abaixo.
   */
  nome: 'Igor Correa',
  historia: [
    'E sempre fui sacaneado por colegas de clube, escola e até mesmo no trabalho por ser magro demais, preguiçoso, e até sem comprometimento.',
    'Eu nunca gostei de ouvir essas palavras, e mesmo com todas as minhas dificuldades eu sempre soube que isso não fazia parte da minha identidade, isso não era quem eu sempre soube que seria.',
    'Essas críticas me levaram a tomar ações que mudariam a minha vida para sempre: entrei na academia, comecei a levar meus estudos na área da nutrição e educação física à sério e desenvolvi uma mentalidade mais organizada e blindada.',
    'Hoje, eu crio conteúdo nas minhas redes sociais exatamente sobre o que eu mais estudei e impacto todos os meses mais de 1 milhão de pessoas a saírem da inércia, buscarem o seu melhor físico e a vida que elas merecem viver.',
    'O Desafio Abdômen Insano de 42 dias foi idealizado para que você dê o primeiro passo e sinta os primeiros resultados de uma vida incrível que você pode viver através da mudança de pequenas ações no seu dia a dia.',
    'Eu acredito, de verdade, que você pode ser mais forte, mais focado e viver a vida dos seus sonhos.',
  ],
  fotoAntes: '/img/igor-antes.webp',
  fotoHoje: '/img/igor-hoje.webp',
} as const;

export const faqSecao = {
  titulo: 'Perguntas frequentes',
} as const;

export const faq: Pergunta[] = [
  {
    pergunta: 'Para quem é o Desafio Abdômen Insano?',
    resposta:
      'Para homens e mulheres que buscam resultados rápidos e duradouros em emagrecimento e definição abdominal.',
  },
  {
    pergunta: 'Sou gordão, vou obter o resultado que espero em 42 dias?',
    resposta:
      'Só jogo com a verdade. Se você estiver MUITO acima do peso, vai precisar seguir o desafio por um tempo a mais. Mas relaxa, você vai se assustar. Basta seguir o plano de treinos e alimentação para alcançar o abdômen insano em pouco tempo.',
  },
  {
    pergunta: 'Eu sou o “falso magro”, esse desafio serve pra mim?',
    resposta:
      'Sim. O Desafio Abdômen Insano foi bem desenhado pra esse público que sofre com um corpo magro de camisa, mas que sempre tem uma gordurinha ali nos flancos e no próprio abdômen.',
  },
  {
    pergunta:
      'Já fiz dieta e emagreci o rosto e os braços, mas a barriga não saiu. Por que dessa vez seria diferente?',
    resposta:
      'Porque dieta genérica emagrece o corpo todo, mas não ataca especificamente a gordura visceral que blinda seu abdômen. O Protocolo Seca-3 sincroniza as 3 alavancas certas, ativação de core, queima calculada e déficit sob medida. A ideia não é só reduzir peso no geral, é construir músculo de verdade.',
  },
  {
    pergunta: 'Já treino na academia. Preciso mudar meu treino todo?',
    resposta:
      'Não, você não precisa abandonar o seu treino de musculação já montado. Você só precisa seguir exatamente a parte do desafio de abdômen após o seu treino de musculação (cardápio, especificidade pro abdômen e os cardios calculados).',
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
      'O app foi feito pra quem já falhou sozinho antes. É gamificado, possui a comunidade Antifalhas te puxando nos dias difíceis e progresso visível semana a semana — você não depende só da sua força de vontade, o sistema não te deixa desistir.',
  },
  {
    pergunta: 'Vou precisar comprar suplemento ou algo a mais pra funcionar?',
    resposta:
      'Não. Tudo que você precisa pra conquistar o Abdômen Insano já está dentro do app. Zero investimento extra.',
  },
  {
    pergunta: 'Definição abdominal não depende de genética? Meu corpo consegue mudar isso?',
    resposta:
      'A genética facilita, mas não decide sozinha. O que realmente define o abdômen é acionar as alavancas certas. Ativação de core, queima calculada e déficit sob medida. Quando a metodologia é bem feita, a grande maioria consegue um ótimo resultado.',
  },
  {
    pergunta: 'O déficit calórico vai me deixar sem energia ou fraco no treino?',
    resposta:
      'Não. Existe uma pequena queda natural de energia por conta do déficit, mas nada exagerado ou que atrapalhe seu dia. Você continua treinando bem e vendo excelentes resultados ao longo dos 42 dias.',
  },
  {
    pergunta: '42 dias é pouco tempo. O resultado não vai sumir depois?',
    resposta:
      'Não necessariamente. O desafio é o ponto de partida perfeito pra você conquistar os hábitos certos, construir um corpo mais forte e após os 42 dias conseguir sustentar o resultado que você conquistou dentro do desafio.',
  },
  {
    pergunta: 'Eu saio com amigos nos finais de semana. Isso vai atrapalhar o resultado?',
    resposta:
      'Sendo sincero? Depende de como você lida com isso. Por isso o Guia Sobrevivência Social está incluso no desafio. Ele te dá o script exato pra sair, aproveitar e continuar dentro do seu déficit, sem sacrificar sua vida social nem seu progresso.',
  },
];

export const suporte = {
  titulo: 'Ficou alguma dúvida?',
  /** Dividido em duas partes pra permitir highlight laranja na segunda. */
  leadAntes:
    'Caso tenha ficado qualquer dúvida sobre o desafio, ou gostaria de falar com a nossa equipe, ',
  leadDestaque: 'entre em contato conosco agora mesmo.',
  linkTexto: 'Chamar o Suporte!',
  linkUrl: process.env.NEXT_PUBLIC_WHATSAPP_URL ?? '',
  /** Fallback quando o link do WhatsApp ainda não foi configurado. */
  emailContato: process.env.NEXT_PUBLIC_EMAIL_SUPORTE ?? 'suporte@desafioabdomeninsano.com.br',
  emailTexto: 'Escrever pro suporte',
} as const;

export const rodape = {
  navegacao: [
    { rotulo: 'Contato', href: '/contato' },
    { rotulo: 'Políticas de Privacidade', href: '/privacidade' },
    { rotulo: 'Termos de Uso', href: '/termos' },
  ],
  responsaveis: 'Karla — CRN1 23440 · Gledson — CREF 015440-G/DF',
  empresa: '© 2026 SI TREINAMENTOS LTDA · CNPJ 62.568.265/0001-48',
  aviso:
    'Este site não é afiliado ao Facebook ou a qualquer entidade do Facebook. Resultados individuais podem variar conforme dedicação e condição física de cada pessoa.',
} as const;
