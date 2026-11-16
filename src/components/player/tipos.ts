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
}

/** Marco de tempo: dispara uma vez quando o conteúdo chega em `segundos`. */
export interface MarcoPlayer {
  segundos: number;
  /** Chave para lembrar no navegador que o marco já passou (volta revelado). */
  lembrar?: string;
  aoChegar: () => void;
}

export interface PropsPlayer {
  video: VideoInsano;
  opcoes?: OpcoesPlayer;
  marcos?: MarcoPlayer[];
  /** Rótulo acessível do vídeo. */
  titulo: string;
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
}
