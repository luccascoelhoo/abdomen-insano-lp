/**
 * Copy da LP V.3 do Desafio Abdômen Insano (rota /v3).
 *
 * O texto é o do Igor: vem de `lp-v2.ts` por import, na íntegra, e corrigir
 * lá corrige aqui. A V.3 muda o desenho (capa animada, kit no card, botão
 * único, barra fixa, semanas, responsáveis técnicos), não as palavras dele.
 *
 * Respostas do Igor em 29/10/2026, que entram aqui:
 *  - "+5.500 alunos" confirmado;
 *  - R$ 299 é o preço de referência dele: o riscado do card fica;
 *  - treino de 45 minutos (HIIT e abdômen), só colchonete e peso do corpo,
 *    para iniciante e intermediário, e começa a qualquer momento do ano:
 *    viram quatro perguntas novas no FAQ.
 *
 * Fica de fora só a urgência de "por tempo limitado" e "válido até hoje":
 * não existe turma nem prazo (o desafio começa quando a pessoa quiser), então
 * o aviso reiniciaria todo dia sem ser verdade.
 *
 * Marcação dos textos: a mesma do `components/v2/Rico.tsx`.
 */

import { semanas } from './desafio';
import {
  beneficiosV2,
  bonusV2,
  depoimentosV2,
  entregaveisV2,
  expertV2,
  faqV2,
  funcaoV2,
  garantiaV2,
  heroV2,
  ofertaV2,
  problemaV2,
  solucaoV2,
  telasApp,
} from './lp-v2';

/** O botão do Igor, igual em todos os lugares. */
export const ctaV3 = ofertaV2.card.cta;

export const heroV3 = {
  ...heroV2,
  /** Da V.1, confirmado pelo Igor em 29/10/2026. */
  prova: { numero: '+5.500 alunos', texto: 'já estão no desafio' },
  confianca: ['15 dias de garantia', 'Acesso na hora', 'Pagamento único'],
  /** O banner: o abdômen do Igor em primeiro plano, sem a seta do print do Instagram. */
  foto: { src: '/img/igor-inspira.jpg', alt: 'Igor Correa com o abdômen trincado', width: 1200, height: 1600 },
} as const;

export const problemaV3 = {
  ...problemaV2,
  /** Rótulos do desenho dos gomos: antes e depois da capa secar. */
  desenho: { com: 'Com capa', sem: 'Capa zero' },
} as const;

export const funcaoV3 = funcaoV2;

export const solucaoV3 = {
  ...solucaoV2,
  /** Da V.1: a progressão semana a semana, que é o que "progride semana a semana" quer dizer. */
  semanasTitulo: 'Semana a semana, o treino sobe',
  semanas,
  /**
   * Da V.1: os responsáveis técnicos saem do rodapé e viram selo de autoridade.
   * Mesmos registros do rodapé (`rodape.responsaveis` em desafio.ts).
   */
  responsaveis: 'Dieta com nutricionista (**Karla, CRN1 23440**) e treino com educador físico (**Gledson, CREF 015440-G/DF**).',
} as const;

/** A faixa laranja que corre entre o método e os casos. */
export const faixaV3 = ['TRINCAR O ABDÔMEN', 'CAPA ZERO', 'SEM PASSAR FOME', 'PROGRESSÃO TODA SEMANA', 'ACEITA O DESAFIO?'] as const;

export const provaV3 = {
  ...depoimentosV2,
  aviso: 'Resultados variam conforme dedicação e condição física de cada pessoa.',
} as const;

export const passosV3 = {
  ...entregaveisV2,
  telas: telasApp.avaliacao,
  telasRotulo: 'O app montando o seu protocolo',
} as const;

export const beneficiosV3 = {
  ...beneficiosV2,
  /** Da V.2: a jornada do app em três quadros, dia 01, dia 42 e 1 ano. */
  video: {
    poster: '/video/transformacao-poster.webp',
    webm: '/video/transformacao.webm',
    mp4: '/video/transformacao.mp4',
    rotulo: 'Dia 01, dia 42 e 1 ano: a jornada de quem faz o desafio',
  },
} as const;

export const bonusV3 = bonusV2;

export const ofertaV3 = {
  narrativa: {
    ...ofertaV2.narrativa,
    // Sem "Por tempo limitado": o preço não tem data para acabar.
    reforco: 'Sim, isso mesmo! O Desafio Abdômen Insano custa apenas **R$64**',
  },
  card: ofertaV2.card,
} as const;

export const garantiaV3 = garantiaV2;

export const expertV3 = expertV2;

/** As dez perguntas da V.2 e quatro novas, com as respostas que o Igor deu em 29/10/2026. */
export const faqV3 = {
  titulo: faqV2.titulo,
  itens: [
    {
      pergunta: 'Sou iniciante. Consigo fazer o desafio?',
      resposta: 'Consegue. O desafio foi feito para iniciantes e intermediários, e cada exercício tem vídeo de execução.',
    },
    {
      pergunta: 'Quanto tempo dura cada treino?',
      resposta: '45 minutos no total, somando o HIIT e o treino de abdômen.',
    },
    {
      pergunta: 'Dá pra fazer em casa? Preciso de equipamento?',
      // A V.2 fala em "carga" (Função e Escultura): em casa, a progressão vem
      // de séries, repetições e intensidade. Confirmar com o Igor se é isso.
      resposta:
        'Dá. Em casa você só precisa de um colchonete e do peso do próprio corpo. O app adapta o treino ao lugar onde você treina, e a progressão vem das séries, das repetições e da intensidade.',
    },
    {
      pergunta: 'Quando eu começo?',
      resposta: 'Na hora que quiser. Não tem turma nem data de largada: comprou, baixou o app e os seus 42 dias começam.',
    },
    ...faqV2.itens,
  ],
} as const;

export const fechamentoV3 = {
  provocacao: heroV2.provocacao,
  lema: garantiaV2.lema,
} as const;
