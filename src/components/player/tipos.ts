/**
 * Contrato do Player Insano — o nosso player de VSL, no lugar do VTurb.
 *
 * Recursos copiados do COMPORTAMENTO do VTurb que usamos (configuração lida
 * em 16/11/2026 no embed do downsell), nunca do código dele:
 *  - barra de progresso "falsa" (corre rápido no começo e devagar no fim);
 *  - autoplay mudo com aviso "Seu vídeo já começou / Clique para ouvir"; o
 *    clique liga o som e recomeça do início;
 *  - "Você já começou a assistir esse vídeo" → Continuar / Assistir do início;
 *  - sem barra de avanço: só toca/pausa (ninguém pula para a oferta);
 *  - marcos de tempo para revelar elementos da página (botões da oferta).
 *
 * Em 26/11/2026 entrou o resto do catálogo do painel do VTurb (lido no editor
 * do downsell, só o comportamento): pausa inteligente, bloquear pausa,
 * recomeçar no fim, "você já assistiu", rolar até a oferta, ganchos e
 * manchetes, ThumbSniper, controles opcionais (tempo, volume, ±10 s,
 * velocidade, barra real), capítulos, legendas, tela cheia própria, mini
 * player, qualidade inicial, teste A/B e filtro de tráfego. Tudo DESLIGADO por
 * padrão: sem opção nova, o player se comporta como antes.
 *
 * TEMPO: todos os segundos aqui são de CONTEÚDO (`video.currentTime`), como
 * no VTurb. A velocidade (ex.: 1,2x) não muda os números dos marcos.
 */

export interface VideoInsano {
  /** Id estável do vídeo (chave do "continuar assistindo" e das métricas). */
  id: string;
  /** Playlist HLS (`.../master.m3u8`). Safari toca nativo; os outros via hls.js. */
  hls: string;
  /** MP4 de reserva, se o HLS falhar. */
  mp4?: string;
  /** Imagem mostrada antes de tocar (e enquanto carrega). */
  poster: string;
  /** Largura / altura. Vídeo vertical = 9 / 16. */
  proporcao: number;
  /** Duração em segundos (para a barra falsa antes dos metadados chegarem). */
  duracao?: number;
}

export interface OpcoesPlayer {
  /** Velocidade de reprodução (o VTurb rodava a 1,2x). Padrão 1. */
  velocidade?: number;
  /** Cor da barra e dos avisos. Padrão laranja da marca (#ff6b00). */
  cor?: string;
  /**
   * Curvatura da barra falsa: progresso exibido = 1 - (1 - t/d)^alpha.
   * 1 = barra real; 2 = a do VTurb. Padrão 2.
   */
  alphaBarra?: number;
  /** Autoplay mudo com o aviso "clique para ouvir". Padrão true. */
  autoplayMudo?: boolean;
  /** Oferecer continuar de onde parou. Padrão true. */
  retomar?: boolean;
  /** Enviar métricas de retenção para /api/player. Padrão true. */
  metricas?: boolean;

  /* ---------------------------------------------------- textos dos avisos */

  /** Textos do aviso do autoplay mudo. */
  textosAutoplay?: { titulo?: string; acao?: string };
  /** Textos do "você já começou a assistir". */
  textosRetomar?: { titulo?: string; continuar?: string; reiniciar?: string };
  /**
   * Quem já assistiu até o fim vê uma mensagem e "Assistir novamente" no
   * lugar do autoplay. `true` usa os textos padrão. Padrão: desligado.
   */
  jaAssistiu?: boolean | { titulo?: string; botao?: string };

  /* ------------------------------------------------------------ reprodução */

  /** Pausa quando a pessoa troca de aba e volta a tocar quando ela retorna. */
  pausaInteligente?: boolean;
  /** Tocar no vídeo não pausa (só a pausa inteligente e o fim param). */
  bloquearPausa?: boolean;
  /** No fim, volta ao início e toca de novo. */
  repetirAoTerminar?: boolean;
  /**
   * Quando o conteúdo chega em `segundos`, sai da tela cheia e rola a página
   * até o elemento `seletor` (ex.: o botão da oferta).
   */
  rolarAte?: { segundos: number; seletor: string };
  /** Qualidade com que o HLS começa (só hls.js; o Safari decide sozinho). Padrão 'auto'. */
  qualidadeInicial?: 'auto' | 'baixa' | 'media' | 'alta';

  /* ------------------------------------------------------------ na tela */

  /** Textos que aparecem numa faixa de tempo, no vídeo (mini-gancho) ou acima dele (manchete). */
  ganchos?: GanchoPlayer[];
  /** Imagens por cima do vídeo quando a pessoa pausa numa faixa de tempo ou quando termina (ThumbSniper). */
  thumbs?: ThumbPlayer[];
  /** Controles extras. Sem isto, só tocar/pausar e tela cheia. */
  controles?: ControlesPlayer;
  /** Marcadores de capítulo (na barra, se ela for real, e num menu). */
  capitulos?: CapituloPlayer[];
  /** Legenda WebVTT. O servidor do arquivo precisa liberar CORS se for outro domínio. */
  legendas?: { src: string; idioma?: string; rotulo?: string; ligadas?: boolean };
  /**
   * Tela cheia própria (o vídeo cobre a janela, sem a API de tela cheia do
   * navegador). Vale só nos aparelhos marcados.
   */
  imersivo?: {
    celular?: boolean;
    desktop?: boolean;
    /** Entra no modo imersivo ao ligar o som. */
    expandirAoTocar?: boolean;
    /** Sai do modo imersivo quando a pessoa pausa. */
    minimizarAoPausar?: boolean;
  };
  /** Com som e fora da tela, o vídeo continua num mini player no canto. */
  miniPlayer?: boolean;
}

/** Texto numa faixa de tempo de conteúdo `[de, ate]`. */
export interface GanchoPlayer {
  de: number;
  ate: number;
  texto: string;
  /** 'video' = por cima do vídeo (mini-gancho); 'acima' = manchete acima do player. Padrão 'video'. */
  lugar?: 'video' | 'acima';
}

/** Imagem mostrada com o vídeo pausado dentro de `[de, ate]`, ou no fim (`noFim`). */
export interface ThumbPlayer {
  imagem: string;
  alt?: string;
  de?: number;
  ate?: number;
  noFim?: boolean;
}

export interface ControlesPlayer {
  /** Tempo atual / total. */
  tempo?: boolean;
  /** Botão de mudo. */
  volume?: boolean;
  /** Voltar e avançar 10 s. */
  pular10?: boolean;
  /** Botão que alterna a velocidade. `true` = [1, 1.25, 1.5, 2]. */
  velocidade?: boolean | number[];
  /** Barra real, clicável (no lugar da barra "falsa"). Deixa a pessoa pular para a oferta. */
  barra?: boolean;
  /** Botão de tela cheia. Padrão true. */
  telaCheia?: boolean;
}

export interface CapituloPlayer {
  segundos: number;
  titulo: string;
}

/**
 * Marco de tempo: dispara uma vez quando o conteúdo chega em `segundos` (ou
 * em `porcento` da duração). Informe um dos dois.
 */
export interface MarcoPlayer {
  segundos?: number;
  porcento?: number;
  /** Chave para lembrar no navegador que o marco já passou (volta revelado). */
  lembrar?: string;
  aoChegar: () => void;
}

/**
 * Teste A/B: cada visitante cai numa variante (sorteada uma vez e lembrada no
 * navegador) e as métricas saem marcadas com `teste:variante`. O vencedor é
 * escolhido olhando `player_variantes` no Supabase e fixado com `vencedora`.
 */
export interface TestePlayer {
  /** Id do teste: `a-z`, `0-9`, `_` e `-`. */
  id: string;
  variantes: { id: string; peso?: number; opcoes?: OpcoesPlayer }[];
  /** Com isto, todo mundo vê esta variante (fim do teste). */
  vencedora?: string;
}

/**
 * Filtro de tráfego: quem não passa vê `alternativo` (outro vídeo) ou, sem
 * ele, nenhum vídeo. Em qualquer bloqueio, os marcos são liberados na hora:
 * ninguém fica sem o botão da oferta.
 */
export interface FiltroPlayer {
  dispositivos?: Dispositivo[];
  /** Prefixos de idioma do navegador, ex.: ['pt']. */
  idiomas?: string[];
  /** Códigos de país (ISO, ex.: ['BR', 'PT']). Lido do cabeçalho da Vercel. */
  paises?: string[];
  /** Só passa quem chega com `?nome=valor` na URL. */
  chaveUrl?: { nome: string; valor: string };
  alternativo?: VideoInsano;
}

export type Dispositivo = 'celular' | 'tablet' | 'desktop';

export interface PropsPlayer {
  video: VideoInsano;
  opcoes?: OpcoesPlayer;
  marcos?: MarcoPlayer[];
  /** Rótulo acessível do vídeo. */
  titulo: string;
  teste?: TestePlayer;
  filtro?: FiltroPlayer;
}

/* ------------------------------------------------------------- métricas */

/**
 * Eventos de retenção. `s` = segundo de conteúdo (inteiro).
 * - `carregou`: o player apareceu na tela;
 * - `autoplay`: começou a tocar mudo sozinho;
 * - `som`: a pessoa clicou para ouvir (recomeça do 0);
 * - `play` / `pausa`: toque da pessoa;
 * - `progresso`: a cada BLOCO_SEGUNDOS de conteúdo assistido COM SOM;
 * - `retomou` / `do_inicio`: escolha no aviso "você já começou";
 * - `marco`: um marco de tempo disparou (ex.: botão da oferta apareceu);
 * - `fim`: terminou.
 */
export type TipoEventoPlayer =
  | 'carregou'
  | 'autoplay'
  | 'som'
  | 'play'
  | 'pausa'
  | 'progresso'
  | 'retomou'
  | 'do_inicio'
  | 'marco'
  | 'fim';

export const BLOCO_SEGUNDOS = 5;

export interface EventoPlayer {
  t: TipoEventoPlayer;
  s: number;
  /** Momento no navegador (ms desde a época), só para ordenar. */
  em: number;
}

/** Lote enviado por `sendBeacon` para POST /api/player. */
export interface LotePlayer {
  video: string;
  /** Id aleatório da visita ao vídeo (não identifica a pessoa). */
  sessao: string;
  /** Página onde o vídeo está (pathname, sem query). */
  pagina: string;
  eventos: EventoPlayer[];
  utm?: Record<string, string>;
  /** `teste:variante` quando há teste A/B. */
  variante?: string;
}
