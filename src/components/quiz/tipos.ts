/**
 * Contrato do quiz (`/quiz`). Todas as telas são dados (`content/quiz.ts`);
 * cada `k` tem um componente que a desenha (`components/quiz/telas/*`).
 *
 * Regra de ouro: quem desenha a tela NÃO decide a navegação. Recebe a tela, as
 * respostas e `responder(...)`; o motor (`motor.ts`) guarda e avança.
 */

/** Respostas acumuladas, por `chave` da tela. Multi = string[]. */
export type Respostas = Record<string, string | string[] | number | boolean | undefined>;

/** Texto fixo ou calculado a partir das respostas (ex.: "{nome}, a sua capa…"). */
export type Texto = string | ((r: Respostas) => string);

export interface Opcao {
  /** Valor gravado. Quando a tela alimenta o app, é o valor EXATO do app. */
  v: string;
  /** Rótulo exibido. */
  rotulo: string;
  /** Imagem (telas `cards`). */
  img?: string;
  /** Marca a opção "nenhum/nada": desmarca as outras (telas `multi`). */
  exclusiva?: boolean;
}

interface Base {
  /** Bloco da barra de progresso (1 a 6). */
  bloco: 1 | 2 | 3 | 4 | 5 | 6;
  /** Só mostra a tela quando a função devolve true. */
  quando?: (r: Respostas) => boolean;
}

/** Abertura: título grande + opções de resposta logo na primeira tela. */
export interface TelaAbertura extends Base {
  k: 'abertura';
  chave: string;
  titulo: Texto;
  sub: Texto;
  pergunta: string;
  opcoes: Opcao[];
  img: string;
}

/** Escolha única com foto em cada opção (grade 2x2). */
export interface TelaCards extends Base {
  k: 'cards';
  chave: string;
  titulo: Texto;
  sub?: Texto;
  opcoes: Opcao[];
}

/** Escolha única em lista. Avança ao tocar. */
export interface TelaLista extends Base {
  k: 'lista';
  chave: string;
  titulo: Texto;
  sub?: Texto;
  opcoes: Opcao[];
}

/** Múltipla escolha. Avança no botão "Continuar" (exige ≥ 1). */
export interface TelaMulti extends Base {
  k: 'multi';
  chave: string;
  titulo: Texto;
  sub?: Texto;
  opcoes: Opcao[];
}

/** Número com unidade (altura, peso). */
export interface TelaNumero extends Base {
  k: 'numero';
  chave: string;
  titulo: Texto;
  sub?: Texto;
  unidade: 'cm' | 'kg';
  min: number;
  max: number;
  /** Valor inicial sugerido no campo. */
  inicial: number;
  /** Validação extra; devolve a mensagem de erro ou null. */
  validar?: (valor: number, r: Respostas) => string | null;
}

/** Data de nascimento (dia/mês/ano). Grava `nascimento` = 'AAAA-MM-DD'. */
export interface TelaNascimento extends Base {
  k: 'nascimento';
  chave: 'nascimento';
  titulo: Texto;
  sub?: Texto;
  /** Idade mínima aceita (o app exige 18). */
  idadeMinima: number;
}

/** Data futura (ex.: o casamento). Grava 'AAAA-MM-DD' em `chave`. */
export interface TelaDataEvento extends Base {
  k: 'dataEvento';
  chave: string;
  titulo: Texto;
  sub?: Texto;
  /** Até quantos dias à frente aceita. */
  maxDias: number;
}

/** Tela de conteúdo entre perguntas. Avança no botão. */
export interface TelaInfo extends Base {
  k: 'info';
  titulo: Texto;
  linhas: Texto[];
  img?: string;
  /** object-position da foto (ex.: '50% 20%' para mostrar o rosto). */
  imgPosicao?: string;
  /** Antes e depois de arrastar (montagem com as duas metades), no lugar da foto. */
  comparador?: {
    src: string;
    alt: string;
    rotuloAntes?: string;
    rotuloDepois?: string;
    legenda?: string;
    /** Largura / altura da montagem inteira, ex.: '3 / 2'. */
    proporcao?: string;
    /** Desenha divisória e seta no meio (montagem sem a divisória gravada). */
    divisoria?: boolean;
  };
  /** Destaque numérico grande (ex.: "+5.500"). */
  destaque?: Texto;
  botao?: string;
}

/** "A sua capa é do tipo X": nível calculado pelo motor (`nivelDaCapa`). */
export interface TelaCapa extends Base {
  k: 'capa';
}

/** Carregamento "montando o seu plano" com checklist e antes/depois reais. */
export interface TelaCarregando extends Base {
  k: 'carregando';
  titulo: string;
  etapas: string[];
}

/** Só o nome, numa tela própria (uma coisa por vez). Grava `nome`. */
export interface TelaNome extends Base {
  k: 'nome';
  chave: 'nome';
  titulo: Texto;
  sub?: Texto;
}

/** E-mail + aceite de e-mails (o nome vem da tela `nome`). Grava `email`, `aceiteEmail`. */
export interface TelaEmail extends Base {
  k: 'email';
  titulo: Texto;
  sub: Texto;
  aviso: string;
}

/** Diagnóstico personalizado (IMC, capa, projeção de 42 dias). */
export interface TelaDiagnostico extends Base {
  k: 'diagnostico';
}

/** Os números: IMC, capa, projeção de 42 dias, corpo de hoje e objetivo. */
export interface TelaProjecao extends Base {
  k: 'projecao';
}

/** "Desconto liberado!": o percentual da página de vendas, revelado antes da oferta. */
export interface TelaDesconto extends Base {
  k: 'desconto';
}

/** O plano: as 3 engrenagens personalizadas. */
export interface TelaPlano extends Base {
  k: 'plano';
}

/** Oferta final com o checkout da Cakto. */
export interface TelaOferta extends Base {
  k: 'oferta';
}

export type Tela =
  | TelaAbertura
  | TelaCards
  | TelaLista
  | TelaMulti
  | TelaNumero
  | TelaNascimento
  | TelaDataEvento
  | TelaInfo
  | TelaCapa
  | TelaCarregando
  | TelaNome
  | TelaEmail
  | TelaDiagnostico
  | TelaProjecao
  | TelaPlano
  | TelaDesconto
  | TelaOferta;

/** Props comuns de todo componente de tela. */
export interface PropsTela<T extends Tela = Tela> {
  tela: T;
  respostas: Respostas;
  /** Grava respostas e avança (ou só grava, com `avancar: false`). */
  responder: (valores: Respostas, opcoes?: { avancar?: boolean }) => void;
  /** Avança sem gravar (telas de info, carregamento). */
  avancar: () => void;
  /** Volta direto para a primeira tela de um tipo (ex.: corrigir o e-mail). */
  irPara?: (k: Tela['k']) => void;
  /** Apaga as respostas e volta ao início. */
  recomecar?: () => void;
}

/** Níveis da "capa" de gordura (Método Capa Zero). */
export type NivelCapa = 'fina' | 'media' | 'grossa' | 'muito-grossa';

/** Projeção de 42 dias usada no diagnóstico (gráfico). */
export interface Projecao {
  pesoAtual: number;
  pesoMeta: number;
  /** Peso estimado ao fim dos 42 dias (nunca abaixo da meta). */
  peso42: number;
  /** Pontos semana a semana, semana 0 a 6. */
  semanas: { semana: number; peso: number }[];
  /** kg por semana usado na conta. */
  ritmoKg: number;
}

/** Payload que a página manda para `/api/quiz` e que vira o cadastro do app. */
export interface PayloadQuiz {
  email: string;
  nome: string;
  aceiteEmail: boolean;
  /** Campos com os nomes e valores EXATOS do cadastro do app (user_metadata). */
  app: Record<string, string | number | string[]>;
  /** Respostas do quiz que não existem no app (para a copy e os e-mails). */
  extras: Record<string, string | string[] | number | boolean>;
  utm: Record<string, string>;
  /** Campo-isca anti-robô: tem que chegar vazio. */
  site?: string;
}
