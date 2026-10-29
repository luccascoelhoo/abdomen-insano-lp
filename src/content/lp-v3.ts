/**
 * Copy da LP V.3 "Capa Zero" do Desafio Abdômen Insano (rota /v3).
 *
 * A V.2 é a página oficial e não é tocada aqui. A V.3 é a proposta enxuta:
 * a mesma oferta e o mesmo mecanismo, em 7 seções no lugar de 13, com uma
 * oferta só e sem urgência de "válido até hoje".
 *
 * Tudo o que é igual à V.2 (casos, telas do app, bônus, FAQ, garantia, rodapé)
 * é importado de `lp-v2.ts` e `desafio.ts`, nunca copiado: corrigir lá corrige
 * aqui. Marcação dos textos: a mesma do `components/v2/Rico.tsx`.
 */

import { bonusV2, depoimentosV2, expertV2, faqV2, garantiaV2, telasApp } from './lp-v2';

export const heroV3 = {
  etiqueta: 'Desafio de 42 dias · treino e dieta no app',
  titulo: 'Seu abdômen já existe.',
  tituloDestaque: 'Falta tirar a capa.',
  sub: 'Treino de abdômen com **carga e progressão** e uma **dieta calculada pra você**, juntos no app. Em casa ou na academia, sem passar fome.',
  cta: 'QUERO TIRAR A CAPA',
  confianca: ['15 dias de garantia', 'Acesso na hora', 'Pagamento único'],
  foto: { src: '/img/hero-atleta.jpg', alt: 'Igor Correa mostrando o abdômen trincado', width: 1400, height: 1750 },
} as const;

export const capaV3 = {
  etiqueta: 'Por que não apareceu até hoje',
  titulo: 'Todo mundo nasce com os gomos. O que esconde é a ((capa de gordura)).',
  texto:
    'Quando você come mais do que gasta, o corpo guarda o excesso, e o lugar preferido dele é o abdômen. Por isso abdominal sozinho nunca resolveu, e dieta sozinha também não.',
  /** Rótulos do desenho dos gomos: antes e depois da capa secar. */
  desenho: { com: 'Com capa', sem: 'Capa zero' },
  tabela: [
    { fez: 'Só abdominal', acontece: 'Músculo forte, escondido embaixo da capa.', funciona: false },
    { fez: 'Só dieta', acontece: 'Barriga lisa, sem gomo: o "falso magro".', funciona: false },
    { fez: 'As duas juntas', acontece: 'A capa seca e o gomo que aparece já está construído.', funciona: true },
  ],
  fecho: 'O desafio ataca as duas frentes **ao mesmo tempo**.',
} as const;

export const metodoV3 = {
  etiqueta: 'Método Capa Zero',
  titulo: 'Três engrenagens rodando juntas por [[42 dias]].',
  engrenagens: [
    {
      numero: '01',
      titulo: 'Corte',
      texto: 'Plano alimentar calculado pelo seu peso, pela sua rotina e pelo que você gosta de comer. **Cabe o churrasco de domingo.**',
      imagem: { src: '/img/metodo-02.jpg', alt: 'Marmitas de um plano alimentar' },
    },
    {
      numero: '02',
      titulo: 'Escultura',
      texto: 'Abdômen treinado como peito: **carga, séries e intensidade sobem toda semana**, em casa ou na academia.',
      imagem: { src: '/img/metodo-01.jpg', alt: 'Treino de abdômen na barra' },
    },
    {
      numero: '03',
      titulo: 'Dados',
      texto: 'Você marca carga, repetições e descanso de cada série no app. **A evolução segue o que você fez, não o achismo.**',
      imagem: { src: '/img/app/serie-marcada.webp', alt: 'Série marcada no app: repetições, carga e descanso' },
    },
  ],
  comecoTitulo: 'Como você começa',
  passos: [
    { titulo: 'Baixa o app', texto: 'iOS ou Android, com o mesmo e-mail da compra.' },
    { titulo: 'Responde a avaliação', texto: 'De 25 a 40 perguntas sobre rotina, hábitos e alimentação.' },
    { titulo: 'Recebe tudo pronto', texto: 'Treino, dieta e vídeo de execução de cada exercício.' },
  ],
  telas: telasApp.avaliacao,
  telasRotulo: 'A avaliação do app montando o seu protocolo',
} as const;

export const provaV3 = {
  titulo: 'Quem já [[tirou a capa]]',
  sub: 'Alunos reais do desafio. Arrasta pro lado.',
  casos: depoimentosV2.casos,
} as const;

export const ofertaV3 = {
  etiqueta: 'O que você leva',
  titulo: 'Tudo isso por [[menos de R$ 2 por dia]].',
  sub: '42 dias de desafio, 1 ano de acesso, pagamento único. Sem mensalidade.',
  bonusTitulo: 'O que tem em cada bônus',
  bonus: bonusV2.itens,
  garantia: {
    numero: garantiaV2.selo.numero,
    rotulo: garantiaV2.selo.rotulo,
    titulo: 'Garantia incondicional de 15 dias',
    texto: 'Entrou, baixou o app, viu tudo e não curtiu? Manda um e-mail e o dinheiro volta. O dobro do que a lei obriga. **O risco é meu.**',
    email: garantiaV2.email,
  },
} as const;

export const igorV3 = {
  etiqueta: 'Quem criou o desafio',
  antes: { foto: expertV2.antes.foto, legenda: 'Antes: zoado pela magreza' },
  depois: { foto: expertV2.depois.foto, legenda: 'Hoje: referência de shape' },
  texto: [
    'Eu me chamo **Igor Correa**. Fui o magro zoado no clube, na escola e no trabalho.',
    'Entrei na academia, estudei nutrição e educação física a sério e virei o que diziam que eu nunca seria.',
    'Hoje **mais de 1 milhão de pessoas por mês** acompanham o meu conteúdo. O desafio é o primeiro passo que eu queria ter tido.',
  ],
} as const;

/** As seis perguntas que mais seguram a compra, na ordem da dúvida. */
const PERGUNTAS_FAQ = [
  'Eu sou o “falso magro”, esse desafio serve pra mim?',
  'Já treino na academia. Preciso mudar meu treino todo?',
  'Não tenho tempo pra academia todo dia. Dá pra fazer com menos frequência?',
  'Não sou disciplinado. Já comecei várias coisas e não terminei. Como sei que vou concluir esse?',
  'Vou precisar comprar suplemento ou algo a mais pra funcionar?',
  'Eu saio com amigos nos finais de semana. Isso vai atrapalhar o resultado?',
];

export const faqV3 = {
  titulo: 'Perguntas frequentes',
  itens: PERGUNTAS_FAQ.map((p) => {
    const item = faqV2.itens.find((f) => f.pergunta === p);
    if (!item) throw new Error(`FAQ da V.3 aponta para pergunta que saiu da V.2: ${p}`);
    return item;
  }),
} as const;

export const stickyV3 = {
  cta: 'ENTRAR NO DESAFIO',
} as const;
