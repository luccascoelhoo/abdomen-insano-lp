/**
 * Copy da LP V.3 "Capa Zero" do Desafio Abdômen Insano (rota /v3).
 *
 * A V.2 é a home e não é tocada aqui. Revisão de 29/10/2026 (auditoria de
 * conversão, arte, tecnologia e copy):
 *  - CTA único "ACEITO O DESAFIO" em todos os botões;
 *  - sai o "de R$ 299" e sai o valor por bônus: nenhum dos dois tem preço
 *    praticado declarado. A oferta se ancora no que vem, não num riscado;
 *  - sai copy de resultado com prazo e de autoimagem negativa (política de
 *    saúde do Meta, que também revisa a página de destino);
 *  - sai "WhatsApp 24h" (vira "direto com a equipe") e as respostas do FAQ
 *    que prometiam demais;
 *  - FAQ próprio: não depende mais da grafia das perguntas da V.2.
 *
 * Fica de fora até o Igor confirmar: tempo de treino por dia, equipamento
 * para treinar em casa, se serve para iniciante, valor de referência do app,
 * do desafio e do curso, legendas dos casos e data de largada de turma.
 *
 * Marcação dos textos: a mesma do `components/v2/Rico.tsx`.
 */

import { semanas } from './desafio';
import { bonusV2, depoimentosV2, expertV2, garantiaV2, telasApp } from './lp-v2';

export const ctaV3 = 'ACEITO O DESAFIO';

export const heroV3 = {
  etiqueta: 'O desafio de 42 dias do Igor Correa',
  titulo: 'Seu abdômen já existe.',
  tituloDestaque: 'Falta arrancar a capa.',
  sub: 'Treino de abdômen com **carga que sobe toda semana** e **dieta calculada pra você**, no mesmo app. Em casa ou na academia, **sem passar fome**.',
  confianca: ['15 dias de garantia', 'Acesso na hora', 'Pagamento único'],
  /** Da V.1: o número é o que a própria página do Igor afirmava. Confirmar com ele. */
  prova: { numero: '+5.500 alunos', texto: 'já estão no desafio' },
  foto: { src: '/img/hero-atleta.jpg', alt: 'Igor Correa mostrando o abdômen trincado', width: 1400, height: 1750 },
} as const;

export const capaV3 = {
  etiqueta: 'Por que ainda não apareceu',
  titulo: 'Você faz abdominal, corta o doce, e a barriga não sai. A culpa é da ((capa de gordura)).',
  texto:
    'Comeu mais do que gastou, o corpo guarda. E o lugar preferido dele é exatamente o abdômen. Meses assim e a capa só engrossa.',
  /** Rótulos do desenho dos gomos: antes e depois da capa secar. */
  desenho: { com: 'Com capa', sem: 'Capa zero' },
  tabela: [
    { fez: 'Só abdominal', acontece: 'Músculo forte, escondido embaixo da capa.', funciona: false },
    { fez: 'Só dieta', acontece: 'Barriga lisa, sem gomo: o "falso magro".', funciona: false },
    { fez: 'As duas juntas', acontece: 'A capa seca e o gomo que aparece já está construído.', funciona: true },
  ],
  fecho: 'Uma frente sozinha não fecha a conta. **O desafio ataca as duas ao mesmo tempo.**',
} as const;

export const igorV3 = {
  etiqueta: 'Quem vai te puxar',
  titulo: 'Eu fui o [[magro zoado]].',
  antes: { foto: expertV2.antes.foto, legenda: 'Antes: o magro zoado' },
  depois: { foto: expertV2.depois.foto, legenda: 'Hoje: referência de shape' },
  texto: [
    'Eu sou o **Igor Correa**. Fui zoado no clube, na escola e no trabalho.',
    'Cansei. Entrei na academia, estudei nutrição e educação física a sério e virei o que diziam que eu nunca seria.',
    'Botei no desafio o caminho que eu queria ter tido no começo.',
  ],
  numero: { valor: '+1 MI', legenda: 'de pessoas por mês acompanham o meu conteúdo' },
} as const;

export const metodoV3 = {
  etiqueta: 'Método Capa Zero',
  titulo: 'Três engrenagens. Rodando juntas. Por [[42 dias]].',
  engrenagens: [
    {
      numero: '01',
      titulo: 'Corte',
      texto: 'Dieta calculada pelo seu peso, sua rotina e o que você gosta de comer. Déficit **sem passar fome**. **Cabe o churrasco de domingo.**',
      imagem: { src: '/img/metodo-02.jpg', alt: 'Marmitas de um plano alimentar' },
    },
    {
      numero: '02',
      titulo: 'Escultura',
      texto: 'Abdômen treinado como peito: **carga, séries e intensidade sobem toda semana.** Em casa ou na academia.',
      imagem: { src: '/img/metodo-01.jpg', alt: 'Treino de abdômen na barra' },
    },
    {
      numero: '03',
      titulo: 'Dados',
      texto: 'Você marca carga, repetição e descanso de cada série. **Quem manda na evolução é o que você fez, não o achismo.**',
      imagem: { src: '/img/app/serie-marcada.webp', alt: 'Série marcada no app: repetições, carga e descanso' },
    },
  ],
  /** Da V.1: a progressão semana a semana, que é o que "carga que sobe" quer dizer. */
  semanasTitulo: 'Semana a semana, a carga sobe',
  semanas,
  /**
   * Da V.1: os responsáveis técnicos saem do rodapé e viram selo de autoridade.
   * Mesmos registros do rodapé (`rodape.responsaveis` em desafio.ts).
   */
  responsaveis: 'Dieta com nutricionista (**Karla, CRN1 23440**) e treino com educador físico (**Gledson, CREF 015440-G/DF**).',
  comecoTitulo: 'Em 3 passos você tá dentro',
  passos: [
    { titulo: 'Baixa o app', texto: 'iOS ou Android, com o e-mail da compra.' },
    { titulo: 'Responde a avaliação', texto: 'De 25 a 40 perguntas sobre rotina, hábitos e alimentação.' },
    { titulo: 'Recebe tudo pronto', texto: 'Treino, dieta e vídeo de execução de cada exercício.' },
  ],
  telas: telasApp.avaliacao,
  telasRotulo: 'O app montando o seu protocolo',
} as const;

/** A faixa laranja que corre entre o método e os casos. */
export const faixaV3 = ['TRINCAR O ABDÔMEN', 'CAPA ZERO', 'SEM PASSAR FOME', 'CARGA QUE SOBE', 'BORA'] as const;

export const provaV3 = {
  titulo: 'Quem já [[arrancou a capa]]',
  sub: 'Alunos reais do desafio. Arrasta pro lado.',
  aviso: 'Resultados variam conforme dedicação e condição física de cada pessoa.',
  casos: depoimentosV2.casos,
  /*
   * Da V.2: os benefícios de desejo, só os que não prometem resultado no corpo
   * nem falam mal da aparência de quem lê (política de saúde do Meta). Ficam
   * de fora o "inchado ou retido" e a "gordurinha debaixo do umbigo".
   */
  beneficiosTitulo: 'O que muda quando a capa sai',
  beneficios: [
    'Vai ter **um plano que os amigos vão querer copiar**.',
    '**Vai correr na direção certa**, sem se matar de treinar nem passar fome.',
    '**Vai ganhar rotina e disciplina** que ficam depois dos 42 dias.',
  ],
} as const;

/**
 * Os bônus da V.2, com o WhatsApp sem a promessa de 24h e uma linha de
 * benefício cada. As chaves são os títulos exatos da V.2: se lá um bônus for
 * renomeado, o `tsc` quebra aqui, em vez de a V.3 voltar a mostrar o texto
 * antigo (e o "24h") em silêncio.
 */
type TituloBonusV2 = (typeof bonusV2.itens)[number]['titulo'];
const BENEFICIO_BONUS: Record<TituloBonusV2, { titulo?: string; linha: string }> = {
  'WhatsApp 24h': { titulo: 'WhatsApp direto com a equipe', linha: 'Dúvida no meio do caminho? Fala com quem entende.' },
  'Passe Livre de 1 Ano': { linha: 'Refaz, ajusta e mantém o resultado depois dos 42 dias.' },
  'Comunidade Anti Falhas': { linha: 'Gente correndo junto nos dias em que dá vontade de largar.' },
  'Guia Fim de Semana Sem Culpa': { linha: 'Churrasco, rodízio e cerveja sem jogar a semana fora.' },
  'Protocolo Anti-Inchaço': { linha: 'Sono, água, sal e fibra pra barriga parar de estufar.' },
};

/*
 * Sem valor por bônus e sem soma: os valores da V.2 não têm base declarada, e
 * o "Passe Livre de 1 Ano" é o próprio acesso de 1 ano do produto. Âncora sem
 * preço praticado é o mesmo problema que tirou o "de R$ 299". Volta quando o
 * Igor confirmar valores de referência.
 */
const bonus = bonusV2.itens.map((b) => ({
  rotulo: b.rotulo,
  titulo: BENEFICIO_BONUS[b.titulo].titulo ?? b.titulo,
  linha: BENEFICIO_BONUS[b.titulo].linha,
}));

export const ofertaV3 = {
  /** Da V.2: a jornada do app em três quadros, dia 01, dia 42 e 1 ano. */
  video: {
    poster: '/video/transformacao-poster.webp',
    webm: '/video/transformacao.webm',
    mp4: '/video/transformacao.mp4',
    rotulo: 'Dia 01, dia 42 e 1 ano: a jornada de quem faz o desafio',
  },
  etiqueta: 'O que você leva hoje',
  titulo: 'Tudo o que eu queria ter tido no começo, [[num app só]].',
  sub: '42 dias de desafio, 1 ano de acesso, pagamento único. Sem mensalidade.',
  principal: [
    { titulo: 'App do desafio (iOS e Android)', linha: 'Treino, dieta e evolução no bolso.' },
    { titulo: 'Desafio Abdômen Insano personalizado', linha: 'Protocolo montado na sua avaliação, não um PDF genérico.' },
    { titulo: 'Curso Abdômen Insano', linha: 'Vídeo de execução de cada exercício.' },
  ],
  bonus,
  preco: {
    provocacao: 'Na boa? Eu podia cobrar caro. Não vou.',
    linha: 'Você leva tudo por',
    /** Só aparece se for verdade com o preço lido da Cakto (ver LpV3). */
    reforco: 'Dá [[menos de R$ 2 por dia]] dos 42 dias.',
    microcopy: 'Pagamento único · acesso liberado no e-mail da compra',
  },
  garantia: {
    numero: garantiaV2.selo.numero,
    rotulo: garantiaV2.selo.rotulo,
    titulo: '15 dias pra testar. O risco é meu.',
    texto: 'Entrou, baixou o app, viu tudo e não curtiu? Manda um e-mail e o dinheiro volta inteiro. É o dobro do que a lei obriga.',
    email: garantiaV2.email,
  },
} as const;

export const faqV3 = {
  titulo: 'Perguntas frequentes',
  itens: [
    {
      pergunta: 'Eu sou o "falso magro", serve pra mim?',
      resposta:
        'Serve. Foi desenhado pra quem é magro de camisa mas tem a gordurinha nos flancos e no abdômen: tira a capa e constrói o gomo junto.',
    },
    {
      pergunta: 'Já treino na academia. Preciso mudar tudo?',
      resposta: 'Não. Mantém sua musculação e encaixa a parte do desafio depois: abdômen com carga, cardápio e cardio calculados.',
    },
    {
      pergunta: 'Já comecei várias coisas e larguei. Por que essa seria diferente?',
      resposta:
        'Porque você não fica sozinho. Tem progresso visível no app, a Comunidade Anti Falhas e o WhatsApp da equipe pros dias difíceis.',
    },
    {
      pergunta: 'Como recebo o acesso?',
      resposta: 'Pagou, o acesso chega no e-mail da compra. Baixa o app com esse mesmo e-mail e começa pela avaliação.',
    },
    {
      pergunta: 'Saio com os amigos no fim de semana. Atrapalha?',
      resposta: 'Depende de como você faz. Por isso o Guia Fim de Semana Sem Culpa vem junto: sai, aproveita e continua no plano.',
    },
    {
      pergunta: 'Preciso comprar suplemento?',
      resposta: 'Não. Tudo o que você precisa está dentro do app.',
    },
  ],
} as const;

export const fechamentoV3 = {
  titulo: 'Daqui a 42 dias o desafio já acabou. A pergunta é se [[você vai ter feito]].',
  sub: 'Treino com carga, dieta sem fome, equipe no WhatsApp e 15 dias de garantia.',
} as const;
