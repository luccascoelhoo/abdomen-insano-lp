/**
 * Copy da LP V.2 do Desafio Abdômen Insano (rota /v2).
 *
 * Regra do projeto: texto de venda mora em src/content, nunca no componente.
 * O que é compartilhado com a página atual e com o funil (checkout, rodapé
 * legal, link de suporte) continua em `desafio.ts` e é só reaproveitado.
 *
 * Marcação dentro dos textos (lida por `components/v2/Rico.tsx`):
 *   **texto**  → negrito
 *   [[texto]]  → cor de destaque (laranja)
 *   ((texto))  → destaque com sublinhado desenhado à mão
 *   ~~texto~~  → riscado (preço "de")
 *
 * Ajustes feitos sobre a copy recebida (29/10/2026, a pedido):
 *  - grafia e pontuação: "pisicna" → "piscina", "À partir" → "A partir",
 *    "IOS" → "iOS", "à sério" → "a sério", vírgula antes de "e", "mas… mas";
 *  - números que não fechavam: "1 real por dia" → "R$ 1,52 por dia" (64 ÷ 42) e
 *    "R$ 300 em bônus" → "mais de R$ 300" (os valores somam R$ 377);
 *  - nomes iguais aos da página: "Protocolo Seca-3" → "Método Capa Zero",
 *    "Guia Sobrevivência Social" → "Guia Fim de Semana Sem Culpa",
 *    "Antifalhas" → "Anti Falhas";
 *  - a parcela de "5 REAIS" não existe na Cakto: o card mostra a real, lida de lá.
 */

export const heroV2 = {
  tituloDestaque: 'Conquiste um abdômen trincado, estético e seco',
  tituloResto: 'com o desafio abdômen insano',
  sub: 'Em 42 dias seus amigos não vão entender nada. Você vai eliminar **essa gordura chata do abdômen**, conquistar os gomos definidos e uma postura de respeito!',
  /** CTA sem link (decisão de 24/10/2026): não rola até o preço. */
  provocacao: 'Aceita o desafio?',
  foto: { src: '/img/hero-atleta.jpg', alt: 'Igor Correa mostrando o abdômen trincado', width: 1400, height: 1750 },
} as const;

export const problemaV2 = {
  tituloAntes: 'O seu abdômen já existe,',
  tituloDestaque: 'ele só está ((escondido.))',
  paragrafos: [
    '**Todo mundo já nasce com os gomos**, o que muda é o quanto de gordura decide ficar por cima deles.',
    'Basicamente, quando o percentual de gordura tá alto, o seu abdômen fica praticamente impossível de ser visto.',
  ],
  capa: 'A gordura atua como uma [[CAPA]] tampando os gomos definidos.',
  explicacao:
    'Ou seja, quando você come mais calorias do que gasta, o corpo guarda o excesso de calorias, e um dos lugares preferidos pra guardar esse excesso…',
  punch: 'É exatamente no abdômen.',
  tempo: ['Mantenha isso por meses…', 'e veja a capa engrossar cada vez mais.'],
  consequenciasLead: 'E é aí que…',
  consequencias: [
    '[[Inseguranças aparecem]] na hora de tirar a camisa na piscina, na praia e na hora H',
    'Você [[compara o seu abdômen]] com o de outras pessoas no instagram',
    'Sua [[autoestima cai]] ao perceber que nada que você tentou antes funcionou pra você',
  ],
  faixa: 'MAS NÃO PARA POR AÍ!',
} as const;

export const funcaoV2 = {
  titulo: 'Quer bugar tudo com o abdômen trincado, estético e seco?',
  subtitulo: 'Ataque 2 frentes [[AO MESMO TEMPO!]]',
  frentes: [
    {
      numero: '1º',
      titulo: 'Tire a capa',
      texto:
        'Comece a gastar mais calorias e coma menos por um tempo específico, **sem passar fome**, é isso que vai tirar a capa de gordura e te manter consistente.',
    },
    {
      numero: '2º',
      titulo: 'Construa o abdômen',
      texto: 'Treine o abdômen como você treina o peito: **com carga, progressão e volume semanal certo.**',
    },
  ],
  tabelaTitulo: 'Uma frente sozinha não fecha a conta:',
  tabelaColunas: ['O que você fez', 'O que acontece'],
  tabela: [
    { fez: 'Só abdominal?', acontece: 'Músculo mais forte, ainda escondido pela capa.', funciona: false },
    { fez: 'Só dieta?', acontece: 'Barriga mais lisa, mas sem gomos marcados: o "falso magro".', funciona: false },
    { fez: 'As duas frentes juntas?', acontece: 'A capa seca e o músculo que aparece já está construído.', funciona: true },
  ],
  perguntas: [
    {
      pergunta: 'Igor, então treinar SÓ abdômen é inútil?',
      respostas: [
        '**Não.** Treinar abdômen dá força, estabilidade, postura e performance, porém treinar SÓ o abdômen não faz milagre, **o percentual de gordura precisa estar baixo.**',
      ],
    },
    {
      pergunta: 'Mas eu já tenho baixo percentual de gordura e não sou definido.',
      respostas: [
        'Então a sua capa já está fina, e **o problema é o treino.**',
        'Abdômen sem carga e sem progressão não cresce, do mesmo jeito que o peito não cresceria se você fizesse sempre as mesmas flexões sem peso.',
      ],
    },
  ],
  fecho: 'Aqui, o seu treino de abdômen [[progride semana a semana.]]',
} as const;

export const solucaoV2 = {
  tituloAntes: 'Por isso o',
  tituloDestaque: '((Desafio Abdômen Insano))',
  tituloDepois: 'existe!',
  sub: 'O **Método Capa Zero** roda sob 3 engrenagens juntas durante 42 dias!',
  engrenagens: [
    {
      rotulo: 'Engrenagem 1',
      titulo: 'Corte',
      texto:
        'Um plano alimentar individualizado, calculado a partir do seu peso, da sua rotina e do que você gosta de comer. **Cabe o churras de domingo e a breja de qualidade.**',
      imagem: { src: '/img/metodo-02.jpg', alt: 'Marmitas de um plano alimentar', width: 1200, height: 1600 },
    },
    {
      rotulo: 'Engrenagem 2',
      titulo: 'Escultura',
      texto:
        'Treino de abdômen com **sobrecarga progressiva**. Carga, séries e intensidade sobem semana a semana, adaptados a onde você treina: em casa ou na academia.',
      imagem: { src: '/img/metodo-01.jpg', alt: 'Treino de abdômen na barra', width: 1600, height: 1200 },
    },
    {
      rotulo: 'Engrenagem 3',
      titulo: 'Dados',
      texto:
        'Você registra a carga, as repetições e o descanso de cada série no app. **Sua evolução é guiada pelo que você realmente fez, não por achismo.**',
      imagem: { src: '/img/app/serie-marcada.webp', alt: 'Série marcada no app: repetições, carga e descanso', width: 540, height: 1200 },
    },
  ],
} as const;

export const depoimentosV2 = {
  titulo: 'Tá todo mundo botando',
  tituloDestaque: '((o abdômen insano!))',
  sub: 'Você é o próximo!',
  /** Antes e depois reais dos alunos, já usados na página atual. */
  casos: [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => ({
    src: `/img/caso-${String(n).padStart(2, '0')}.webp`,
    alt: `Antes e depois de aluno do desafio (${n})`,
  })),
} as const;

/**
 * Telas REAIS do app Flameer, capturadas no emulador (projeto Flameer-Android,
 * pasta capturas/). Aparecem passando sozinhas dentro de um celular
 * (`components/v2/CelularApp.tsx`).
 */
const tela = (nome: string, alt: string) => ({ src: `/img/app/${nome}.webp`, alt });
export const telasApp = {
  baixe: [
    tela('abertura', 'Abertura do app Flameer'),
    tela('boas-vindas', 'Boas-vindas: forje sua evolução física e mental'),
    tela('inicio', 'Início do app: monte seu treino'),
  ],
  avaliacao: [
    tela('nome', 'Avaliação: como podemos te chamar'),
    tela('altura', 'Avaliação: sua altura'),
    tela('peso', 'Avaliação: seu peso atual'),
    tela('objetivo', 'Avaliação: qual é o seu objetivo'),
    tela('foco', 'Avaliação: foco de desenvolvimento'),
    tela('lesoes', 'Avaliação: dores ou limitações físicas'),
    tela('protocolo', 'Montando o seu protocolo'),
  ],
  treinos: [tela('treino-monta', 'Seu treino se monta sozinho'), tela('ficha', 'Ficha do treino do dia')],
  dieta: [tela('dieta', 'Sua dieta no número exato'), tela('refeicoes', 'Quantas refeições diárias')],
  evolucao: [
    tela('serie', 'Treino em andamento com cronômetro'),
    tela('serie-marcada', 'Série marcada: repetições, carga e descanso'),
    tela('registrado', 'Treino registrado'),
  ],
  vitrine: [
    tela('inicio', 'Início do app'),
    tela('ficha', 'Ficha do treino'),
    tela('serie-marcada', 'Série marcada'),
    tela('dieta', 'Dieta no número exato'),
  ],
} as const;

export const entregaveisV2 = {
  titulo: 'Como funciona',
  tituloDestaque: 'essa parada?',
  sub: 'Ao entrar no desafio, siga esse **EXATO passo a passo** para trincar o abdômen nos próximos 42 dias:',
  /**
   * `fundo` é a palavra grande e desfocada atrás de cada passo (desktop).
   * `video` é a gravação real do app no iPhone (`public/video/app/<nome>`),
   * que a home mostra; a /v3 ainda usa as `telas`.
   */
  passos: [
    {
      titulo: 'BAIXE O APLICATIVO',
      texto: 'O aplicativo do desafio te dará acesso ao seu treino e à sua dieta específica.',
      fundo: 'BAIXE',
      video: 'baixe',
      telas: telasApp.baixe,
    },
    {
      titulo: 'AVALIAÇÃO EXCLUSIVA',
      texto:
        'Você vai responder cerca de 25 a 40 perguntas sobre a sua rotina, hábitos e alimentação para o desenvolvimento do desafio personalizado.',
      fundo: 'RESPONDA',
      video: 'avaliacao',
      telas: telasApp.avaliacao,
    },
    {
      titulo: 'TRILHA DE TREINOS INTENSIVOS',
      texto:
        'Com base no que você responder, você recebe o seu desafio pra trincar e definir o abdômen, em casa ou na academia.',
      fundo: 'TREINE',
      video: 'treinos',
      telas: telasApp.treinos,
    },
    {
      titulo: 'SUA ALIMENTAÇÃO SIMPLIFICADA',
      texto: 'A sua dieta individualizada fica disponível na área "Dieta" do aplicativo.',
      fundo: 'COMA',
      video: 'dieta',
      telas: telasApp.dieta,
    },
    {
      titulo: 'VÍDEOS DE EXECUÇÃO',
      texto:
        'Ficou com dúvida em um exercício? Eu gravei vídeos explicando cada execução, pra você não ter nenhuma lesão.',
      fundo: 'ASSISTA',
      video: 'execucao',
    },
    {
      titulo: 'ACOMPANHE A SUA EVOLUÇÃO',
      texto:
        'Você anota o peso de cada série, quantas repetições você fez e o principal: intensifica os treinos de abdômen semana a semana.',
      fundo: 'ANOTE',
      video: 'evolucao',
      telas: telasApp.evolucao,
    },
    {
      titulo: 'ABDÔMEN INSANO',
      texto:
        'Ao final dos 42 dias, você tem um abdômen mais trincado, estético e seco, e a prova de que o problema nunca foi a sua genética.',
      fundo: 'TRINQUE',
      imagem: { src: '/img/caso-04.webp', alt: 'Antes e depois de aluno do desafio', width: 1000, height: 1000 },
    },
  ],
} as const;

export const beneficiosV2 = {
  titulo: 'Depois dos 42 dias no desafio, você não será mais o mesmo,',
  tituloDestaque: 'e todos os seus amigos ((vão perceber…))',
  itens: [
    '**Vai deixar de ser visto como "inchado" ou "retido"** por ter uma barriga mais estufada que o normal',
    '**Vai remover aquela chata gordurinha localizada** debaixo do umbigo e secar de verdade',
    '**Vai ser elogiado por amigos** quando eles notarem a transformação que você conquistou',
    '**Vai correr na direção certa**, sem se "matar" de treinar ou passar fome e ainda assim não ver resultado',
    '**Vai recuperar a sua autoestima**, ser visto com outros olhos pelos seus amigos e se tornar disciplinado',
  ],
} as const;

export const bonusV2 = {
  titulo: 'Hoje é o seu dia de sorte.',
  // Os valores listados somam R$ 377 (a copy dizia "R$ 300").
  sub: 'Você acabou de ganhar mais de R$ 300 em bônus especiais!',
  /**
   * `valor` aparece riscado ao lado de "GRÁTIS" (pedido do Igor em 29/10/2026).
   * `capa` é o e-book desenhado em CSS: foto em preto e branco e o título com
   * a parte [[em laranja]].
   */
  itens: [
    {
      rotulo: 'Bônus 1',
      titulo: 'WhatsApp 24h',
      texto:
        'Receba o contato pessoal da minha equipe de profissionais para tirar suas dúvidas e guiar o seu caminho durante o desafio.',
      valor: null,
      capa: { foto: '/img/igor-hoje.webp', titulo: 'WhatsApp [[24h]] com a equipe', posicao: '50% 30%' },
    },
    {
      rotulo: 'Bônus 2',
      titulo: 'Passe Livre de 1 Ano',
      texto:
        'O desafio dura 42 dias, mas você mantém acesso a tudo por 1 ano: refaça, ajuste e mantenha o resultado.',
      valor: 'R$ 256',
      capa: { foto: '/img/metodo-03.jpg', titulo: 'Passe livre de [[1 ano]]', posicao: '50% 40%' },
    },
    {
      rotulo: 'Bônus 3',
      titulo: 'Comunidade Anti Falhas',
      texto:
        'A partir de hoje você não está mais sozinho! Eu, você e a comunidade vamos correr juntos atrás de um só objetivo!',
      valor: 'R$ 47',
      capa: { foto: '/img/hero-atleta.jpg', titulo: 'Comunidade [[anti falhas]]', posicao: '50% 30%' },
    },
    {
      rotulo: 'Bônus 4',
      titulo: 'Guia Fim de Semana Sem Culpa',
      texto: 'Como encaixar churrasco, rodízio, delivery e cerveja dentro do plano, sem jogar a semana fora.',
      valor: 'R$ 37',
      capa: { foto: '/img/metodo-02.jpg', titulo: 'Guia fim de semana [[sem culpa]]', posicao: '50% 50%' },
    },
    {
      rotulo: 'Bônus 5',
      titulo: 'Protocolo Anti-Inchaço',
      texto: 'Sono, água, sal e fibras: os ajustes simples que deixam a barriga menos estufada no dia a dia.',
      valor: 'R$ 37',
      capa: { foto: '/img/metodo-01.jpg', titulo: 'Protocolo [[anti-inchaço]]', posicao: '40% 40%' },
    },
  ],
} as const;

export const ofertaV2 = {
  narrativa: {
    pergunta: '**Na boa?** Eu poderia cobrar caro por esse desafio, porque ele funciona! Mas não vou cobrar caro.',
    promessa: 'Você vai botar o abdômen trincado e [[sentir a autoconfiança dos deuses.]]',
    // R$ 64 em 42 dias = R$ 1,52/dia (a copy dizia "1 real por dia").
    chamada: 'POR MENOS DE R$2 POR DIA.',
    reforco: 'Sim, isso mesmo! Por tempo limitado, o Desafio Abdômen Insano custa apenas **R$64**',
    fecho: 'São apenas 64 reais pra você trincar a barriga e mudar completamente sua vida.',
    lema: 'Vamos destravar uma vida épica, estética, equilibrada e livre.',
  },
  card: {
    recebeTitulo: 'Você recebe:',
    recebe: ['Acesso ao Aplicativo (iOS ou Android)', 'Desafio Abdômen Insano personalizado', 'Curso Abdômen Insano'],
    bonusTitulo: 'Bônus Exclusivos',
    bonus: [
      'WhatsApp Exclusivo 24h',
      'Passe Livre de 1 Ano',
      'Comunidade Anti Falhas',
      'Guia Fim de Semana Sem Culpa',
      'Protocolo Anti-Inchaço',
    ],
    precoDe: 'R$299',
    /**
     * O parcelamento exibido vem vivo da Cakto (`lib/parcelamento.ts`). Estes
     * valores só aparecem se a consulta falhar — conferidos na Cakto em
     * 28/10/2026: R$ 64 à vista ou 12x de R$ 6,62 (a Cakto repassa os juros).
     */
    reserva: { vezes: 12, parcelaCentavos: 662, avistaCentavos: 6400 },
    provocacao: 'Aceita o desafio?',
    cta: 'ACEITO O DESAFIO!',
  },
} as const;

export const garantiaV2 = {
  selo: { numero: '15', rotulo: 'dias de garantia' },
  titulo: 'Garantia incondicional de 15 dias!',
  paragrafos: [
    'Por lei eu sou obrigado a te dar uma garantia mínima de 7 dias para qualquer compra na internet…',
    '**Porém, eu vou dobrar a aposta.**',
    'Caso você entre no desafio, baixe o aplicativo, tenha o acesso a tudo que é entregue e mesmo assim não se sentir satisfeito com o produto…',
    '**Eu vou te dar 15 dias para pedir o seu dinheiro de volta…**',
  ],
  emailAntes: 'E o processo é muito simples: basta enviar um e-mail para ',
  email: 'administrativo@gruposhapeinsano.com.br',
  emailDepois: ' e solicitar o seu direito de arrependimento.',
  paragrafosFinais: [
    'Agora, **o risco é totalmente meu** e não existe nenhum problema nisso…',
    'Eu fiz isso porque eu garanto que esse desafio pode mudar completamente a sua vida…',
    'E eu quero que você entre, faça o desafio e me mande o seu antes e depois totalmente satisfeito.',
    'Por isso, clique no botão abaixo e entre no desafio abdômen insano.',
  ],
  cta: 'ACEITO O DESAFIO!',
  lema: 'Vamos destravar uma vida épica, estética, equilibrada e livre.',
} as const;

export const expertV2 = {
  titulo: 'O IDEALIZADOR DO',
  tituloDestaque: 'DESAFIO ABDÔMEN INSANO',
  antes: {
    rotulo: 'De um lado:',
    foto: { src: '/img/igor-antes.webp', alt: 'Igor Correa antes, magro', width: 1080, height: 1920 },
    itens: ['Zuado pela magreza', 'Fraco mentalmente', 'Preguiçoso'],
  },
  depois: {
    rotulo: 'Do outro:',
    foto: { src: '/img/igor-hoje.webp', alt: 'Igor Correa hoje, com o shape definido', width: 1080, height: 1920 },
    itens: ['Corpo forte e estético', 'Referência de shape', 'Produtivo e focado'],
  },
  bio: [
    'Eu me chamo **Igor Correa**,',
    'E sempre fui sacaneado por colegas de clube, escola e até mesmo no trabalho por ser magro demais, preguiçoso, e até sem comprometimento.',
    'Eu nunca gostei de ouvir essas palavras, e mesmo com todas as minhas dificuldades eu sempre soube que isso não fazia parte da minha identidade, isso não era quem eu sempre soube que seria.',
    'Essas críticas me levaram a tomar ações que mudariam a minha vida para sempre: **entrei na academia, comecei a levar meus estudos na área da nutrição e educação física a sério** e desenvolvi uma mentalidade mais organizada e blindada.',
    'Hoje, eu crio conteúdo nas minhas redes sociais exatamente sobre o que eu mais estudei e **impacto todos os meses mais de 1 milhão de pessoas** a saírem da inércia, buscarem o seu melhor físico e a vida que elas merecem viver.',
    'O Desafio Abdômen Insano de 42 dias foi idealizado para que você dê **o primeiro passo** e sinta os primeiros resultados de uma vida incrível que você pode viver através da mudança de pequenas ações no seu dia a dia.',
    '**Eu acredito, de verdade, que você pode ser mais forte, mais focado e viver a vida dos seus sonhos.**',
  ],
} as const;

export const faqV2 = {
  titulo: 'Perguntas Frequentes',
  itens: [
    {
      pergunta: 'Eu sou o “falso magro”, esse desafio serve pra mim?',
      resposta:
        'Sim. O Desafio Abdômen Insano foi bem desenhado pra esse público que sofre com um corpo magro de camisa, mas que sempre tem uma gordurinha ali nos flancos e no próprio abdômen.',
    },
    {
      pergunta:
        'Já fiz dieta e emagreci o rosto e os braços, mas a barriga não saiu. Por que dessa vez seria diferente?',
      resposta:
        'Porque só dieta não fecha a conta. O corpo não escolhe de onde tira a gordura, e o abdômen costuma ser um dos últimos lugares a secar: por isso o rosto e os braços afinam primeiro e a barriga fica. Se você para no meio do caminho, a capa continua lá. E mesmo quando ela afina, sem treinar o abdômen com carga e progressão os gomos não aparecem: você vira o "falso magro". O Método Capa Zero ataca as 2 frentes ao mesmo tempo: o déficit calculado pra tirar a capa até o fim e o treino de abdômen que constrói o músculo por baixo dela.',
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
      pergunta: 'Não sou disciplinado. Já comecei várias coisas e não terminei. Como sei que vou concluir esse?',
      resposta:
        'O app foi feito pra quem já falhou sozinho antes. É gamificado, possui a Comunidade Anti Falhas te puxando nos dias difíceis e progresso visível semana a semana — você não depende só da sua força de vontade, o sistema não te deixa desistir.',
    },
    {
      pergunta: 'Vou precisar comprar suplemento ou algo a mais pra funcionar?',
      resposta: 'Não. Tudo que você precisa pra conquistar o Abdômen Insano já está dentro do app. Zero investimento extra.',
    },
    {
      pergunta: 'Definição abdominal não depende de genética? Meu corpo consegue mudar isso?',
      resposta:
        'A genética facilita, mas não decide sozinha. Ela influencia o formato dos gomos e onde a gordura acumula primeiro, mas o que faz o abdômen aparecer são as 2 frentes juntas: tirar a capa de gordura com o déficit certo e construir o músculo com treino progressivo. Quando a metodologia é bem feita, a grande maioria consegue um ótimo resultado.',
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
        'Sendo sincero? Depende de como você lida com isso. Por isso o Guia Fim de Semana Sem Culpa está incluso no desafio. Ele te dá o script exato pra sair, aproveitar e continuar dentro do seu déficit, sem sacrificar sua vida social nem seu progresso.',
    },
  ],
} as const;

export const suporteV2 = {
  texto: 'Se você ainda ficou alguma dúvida ou gostaria de falar com a nossa equipe, pode entrar em contato conosco agora mesmo.',
} as const;

export const rodapeV2 = {
  responsaveisTitulo: 'Responsáveis Técnicos:',
  responsaveis: 'Karla: CRN1 23440 • Gledson: CREF 015440-G /DF',
  empresa: '© 2026 SI TREINAMENTOS LTDA',
  cnpj: 'CNPJ: 62.568.265/0001-48',
} as const;
