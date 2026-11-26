'use client';

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import type HlsType from 'hls.js';
import { caminhoDaPagina } from '@/lib/pagina-de-origem';
import { lerUtm } from '@/lib/utm';
import { dispositivo, escolherVariante, juntarOpcoes, passaNoFiltro, type VarianteEscolhida } from './escolha';
import {
  BLOCO_SEGUNDOS,
  type EventoPlayer,
  type LotePlayer,
  type MarcoPlayer,
  type OpcoesPlayer,
  type PropsPlayer,
  type TipoEventoPlayer,
  type VideoInsano,
} from './tipos';
import './player.css';

/**
 * Player Insano — o nosso player de VSL (no lugar do VTurb).
 *
 * Fases da tela:
 *  - `inicial`: só o pôster; o autoplay mudo começa quando metade aparece;
 *  - `preview`: tocando mudo com o aviso "Seu vídeo já começou / Clique para ouvir";
 *  - `parado`: botão grande de play (autoplay desligado ou bloqueado pelo navegador);
 *  - `retomar`: "Você já começou a assistir esse vídeo" (continuar / do início);
 *  - `assistido`: "Você já assistiu" + "Assistir novamente" (opção `jaAssistiu`);
 *  - `som`: assistindo com som — toque pausa/continua, sem barra de avanço
 *    (a não ser que `controles.barra` ligue a barra real).
 *
 * Nada acontece antes de o player chegar perto da tela: nem hls.js, nem
 * metadados, nem métricas. O tempo do vídeo vive em refs; o React só
 * re-renderiza quando algo da tela muda (fase, pausa, ganchos, modos).
 *
 * Estrutura: `.pi-lugar` guarda o espaço na página (é ele que os
 * IntersectionObservers olham); `.pi` é a caixa do vídeo, que pode sair do
 * lugar para o mini player (canto da tela) ou para o modo imersivo (janela toda).
 */

type Fase = 'inicial' | 'preview' | 'parado' | 'retomar' | 'assistido' | 'som';

interface Acoes {
  ouvir: () => void;
  tocarDoZero: () => void;
  continuar: () => void;
  doInicio: () => void;
  deNovo: () => void;
  alternar: () => void;
  telaCheia: () => void;
  sairImersivo: () => void;
  mudo: () => void;
  pular: (segundos: number) => void;
  irPara: (segundo: number) => void;
  irParaFracao: (fracao: number) => void;
  velocidade: () => void;
  legendas: () => void;
  fecharMini: () => void;
  voltarAoLugar: () => void;
}

type VideoIos = HTMLVideoElement & { webkitEnterFullscreen?: () => void };
type CaixaFs = HTMLDivElement & { webkitRequestFullscreen?: () => void };
type DocFs = Document & { webkitFullscreenElement?: Element | null; webkitExitFullscreen?: () => void };

const COR_PADRAO = '#ff6b00';
/** Quão antes de aparecer o player começa a se preparar (hls.js, metadados). */
const MARGEM_PERTO = '400px 0px';
/** Fração visível para o autoplay mudo começar. */
const FRACAO_VISIVEL = 0.49;
const INTERVALO_ENVIO_MS = 10000;
const INTERVALO_SALVAR_MS = 2000;
/** "Continuar assistindo" só vale entre 5 s e 95% do vídeo. */
const RETOMAR_MINIMO_S = 5;
const RETOMAR_MAXIMO = 0.95;
const ENDPOINT = '/api/player';
const VELOCIDADES_PADRAO = [1, 1.25, 1.5, 2];
/** Espera para rolar até a oferta: deixa o marco do mesmo segundo revelar o botão antes. */
const ESPERA_ROLAGEM_MS = 350;

const TEXTOS = {
  autoplayTitulo: 'Seu vídeo já começou',
  autoplayAcao: 'Clique para ouvir',
  retomarTitulo: 'Você já começou a assistir esse vídeo',
  retomarContinuar: 'Continuar assistindo',
  retomarReiniciar: 'Assistir do início',
  assistidoTitulo: 'Você já assistiu a este vídeo!',
  assistidoBotao: 'Assistir novamente',
};

/* ------------------------------------------------------------ utilidades */

let sessaoDaPagina: string | null = null;

/** Id aleatório por carregamento de página (o mesmo para todos os players dela). */
function sessao(): string {
  if (!sessaoDaPagina) {
    try {
      sessaoDaPagina = crypto.randomUUID();
    } catch {
      // `randomUUID` só existe em contexto seguro (https/localhost).
      sessaoDaPagina = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
    }
  }
  return sessaoDaPagina;
}

function ler(chave: string): string | null {
  try {
    return localStorage.getItem(chave);
  } catch {
    return null;
  }
}

function gravar(chave: string, valor: string) {
  try {
    localStorage.setItem(chave, valor);
  } catch {
    /* storage bloqueado — segue sem lembrar */
  }
}

function apagar(chave: string) {
  try {
    localStorage.removeItem(chave);
  } catch {}
}

function erroDeAutoplay(erro: unknown): boolean {
  return erro instanceof DOMException && erro.name === 'NotAllowedError';
}

function relogio(s: number): string {
  const t = Math.max(0, Math.floor(Number.isFinite(s) ? s : 0));
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const seg = String(t % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${seg}` : `${m}:${seg}`;
}

function listaDeVelocidades(op?: OpcoesPlayer): number[] {
  const v = op?.controles?.velocidade;
  if (!v) return [];
  const lista = (Array.isArray(v) ? v : VELOCIDADES_PADRAO).filter((x) => Number.isFinite(x) && x > 0);
  return lista.length ? lista : VELOCIDADES_PADRAO;
}

/** O modo imersivo vale neste aparelho? */
function imersivoPermitido(op?: OpcoesPlayer): boolean {
  const im = op?.imersivo;
  if (!im) return false;
  return dispositivo() === 'desktop' ? Boolean(im.desktop) : Boolean(im.celular);
}

/* ------------------------------------------------------------ componente */

interface Decisao {
  passa: boolean;
  variante: VarianteEscolhida | null;
}

export function PlayerInsano(props: PropsPlayer) {
  const { teste, filtro } = props;
  const precisaDecidir = Boolean(teste || filtro);
  // Chave estável do que decide: os objetos mudam de identidade a cada render do pai.
  const chaveDecisao = precisaDecidir
    ? JSON.stringify([teste?.id, teste?.vencedora, teste?.variantes.map((v) => [v.id, v.peso]), filtro])
    : '';
  const [decisao, setDecisao] = useState<Decisao | null>(null);
  const propsRef = useRef(props);

  useEffect(() => {
    propsRef.current = props;
  });

  useEffect(() => {
    if (!chaveDecisao) return;
    let vivo = true;
    const { teste: t, filtro: f } = propsRef.current;
    const variante = t ? escolherVariante(t) : null;
    (f ? passaNoFiltro(f) : Promise.resolve(true)).then((passa) => {
      if (vivo) setDecisao({ passa, variante });
    });
    return () => {
      vivo = false;
    };
  }, [chaveDecisao]);

  if (!precisaDecidir) {
    // Trocar de vídeo = player novo do zero (fase, fonte, marcos, métricas).
    const { id, hls, mp4 } = props.video;
    return <Nucleo key={`${id}|${hls}|${mp4 ?? ''}`} {...props} />;
  }

  if (!decisao) return <Espera video={props.video} titulo={props.titulo} />;

  const opcoes = juntarOpcoes(props.opcoes, decisao.variante?.opcoes);
  const rotulo = decisao.variante?.rotulo;

  if (decisao.passa) {
    const { id, hls, mp4 } = props.video;
    return <Nucleo key={`${id}|${hls}|${mp4 ?? ''}|${rotulo ?? ''}`} {...props} opcoes={opcoes} variante={rotulo} />;
  }

  // Bloqueado pelo filtro: a oferta aparece na hora (nunca prender quem pagou).
  const alt = props.filtro?.alternativo;
  return (
    <>
      <LiberarMarcos marcos={props.marcos} />
      {alt ? (
        <Nucleo
          key={`${alt.id}|${alt.hls}|${alt.mp4 ?? ''}`}
          video={alt}
          opcoes={opcoes}
          titulo={props.titulo}
          variante={rotulo}
        />
      ) : (
        <Espera video={props.video} titulo={props.titulo} semVideo />
      )}
    </>
  );
}

/** Espaço do player enquanto decide (teste/filtro), ou sem vídeo nenhum. */
function Espera({ video, titulo, semVideo }: { video: VideoInsano; titulo: string; semVideo?: boolean }) {
  return (
    <div className="pi-envoltorio" style={{ '--pi-cor': COR_PADRAO } as CSSProperties}>
      <div
        className={video.proporcao < 1 ? 'pi-lugar pi-lugar--vertical' : 'pi-lugar'}
        style={{ aspectRatio: String(video.proporcao) }}
      >
        <div className="pi" role="region" aria-label={titulo} aria-busy={!semVideo}>
          {!semVideo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="pi-video" src={video.poster} alt="" />
          )}
        </div>
      </div>
    </div>
  );
}

function LiberarMarcos({ marcos }: { marcos?: MarcoPlayer[] }) {
  const ref = useRef(marcos);
  const feito = useRef(false);
  useEffect(() => {
    // Uma vez só (o StrictMode roda o efeito duas vezes em dev).
    if (feito.current) return;
    feito.current = true;
    ref.current?.forEach((m) => {
      try {
        m.aoChegar();
      } catch (erro) {
        console.error('[player] marco falhou', erro);
      }
      if (m.lembrar) gravar(m.lembrar, '1');
    });
  }, []);
  return null;
}

function Nucleo({ video, opcoes, marcos, titulo, variante }: PropsPlayer & { variante?: string }) {
  const [fase, setFase] = useState<Fase>((opcoes?.autoplayMudo ?? true) ? 'inicial' : 'parado');
  const [pausado, setPausado] = useState(false);
  const [ganchos, setGanchos] = useState<number[]>([]);
  const [thumb, setThumb] = useState(-1);
  const [mini, setMini] = useState(false);
  const [imersivo, setImersivo] = useState(false);
  const [mudo, setMudo] = useState(false);
  const [velocidade, setVelocidade] = useState<number | null>(null);
  const [legendasOn, setLegendasOn] = useState(Boolean(opcoes?.legendas?.ligadas));
  const [menuCapitulos, setMenuCapitulos] = useState(false);
  const [duracaoTela, setDuracaoTela] = useState(video.duracao ?? 0);

  const lugarRef = useRef<HTMLDivElement>(null);
  const caixaRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const barraRef = useRef<HTMLDivElement>(null);
  const tempoRef = useRef<HTMLSpanElement>(null);
  const propsRef = useRef({ video, opcoes, marcos, variante });
  const acoes = useRef<Acoes | null>(null);
  const faseRef = useRef<Fase>(fase);

  // Os objetos de props mudam de identidade a cada render do pai; o player lê
  // sempre a versão mais nova sem reiniciar nada.
  useEffect(() => {
    propsRef.current = { video, opcoes, marcos, variante };
  });

  useEffect(() => {
    const elVideo = videoRef.current;
    const elCaixa = caixaRef.current;
    const elLugar = lugarRef.current;
    const barra = barraRef.current;
    if (!elVideo || !elCaixa || !elLugar) return;
    // Tipos sem `null`: as funções abaixo são declarações (hoisted) e o TS
    // não estreitaria o tipo dentro delas.
    const v: HTMLVideoElement = elVideo;
    const caixa: HTMLDivElement = elCaixa;
    const lugar: HTMLDivElement = elLugar;

    const { id, hls: urlHls, mp4 } = propsRef.current.video;
    const op = () => propsRef.current.opcoes;
    const chavePos = `pi_pos_${id}`;
    const chaveFim = `pi_fim_${id}`;
    const limpar: (() => void)[] = [];

    let faseAtual: Fase = faseRef.current;
    let hls: HlsType | null = null;
    let fonte: 'nenhuma' | 'nativo' | 'hls' | 'mp4' = 'nenhuma';
    let fontePronta = false;
    let esperaFonte: Promise<void> | null = null;
    let posPendente: number | null = null;
    let visivel = false;
    let carregou = false;
    let autoplayRegistrado = false;
    let comSom = false;
    let pausadoPorRolagem = false;
    let pausadoPelaAba = false;
    let falhouDeVez = false;
    let rolou = false;
    let retomarDe = 0;
    let ultimoSalvo = 0;
    let raf = 0;
    let timerEnvio = 0;
    let desmontado = false;
    let ganchosChave = '';
    let velocidadeEscolhida: number | null = null;
    let miniAtivo = false;
    let miniFechado = false;
    let imersivoAtivo = false;
    let overflowAntes = '';
    const disparados = new Set<number>();
    const blocos = new Set<number>();
    const fila: EventoPlayer[] = [];

    function ouvirEvento<K extends keyof HTMLMediaElementEventMap>(
      tipo: K,
      fn: (e: HTMLMediaElementEventMap[K]) => void,
    ) {
      v.addEventListener(tipo, fn);
      limpar.push(() => v.removeEventListener(tipo, fn));
    }

    function mudarFase(f: Fase) {
      faseAtual = f;
      faseRef.current = f;
      setFase(f);
    }

    function duracao(): number {
      if (Number.isFinite(v.duration) && v.duration > 0) return v.duration;
      return propsRef.current.video.duracao ?? 0;
    }

    function aplicarVelocidade() {
      const r = velocidadeEscolhida ?? op()?.velocidade ?? 1;
      v.defaultPlaybackRate = r;
      if (v.playbackRate !== r) v.playbackRate = r;
    }

    /* ---------------------------------------------------------- métricas */

    function registrar(t: TipoEventoPlayer, s: number = v.currentTime) {
      if (op()?.metricas === false) return;
      fila.push({ t, s: Math.max(0, Math.floor(Number.isFinite(s) ? s : 0)), em: Date.now() });
    }

    function enviar() {
      if (!fila.length) return;
      const lote: LotePlayer = {
        video: id,
        sessao: sessao(),
        pagina: caminhoDaPagina(location.pathname, location.hostname),
        eventos: fila.splice(0),
      };
      const utm: Record<string, string> = {};
      for (const [k, valor] of Object.entries(lerUtm())) if (valor) utm[k] = valor;
      if (Object.keys(utm).length) lote.utm = utm;
      if (propsRef.current.variante) lote.variante = propsRef.current.variante;
      const corpo = JSON.stringify(lote);
      try {
        if (navigator.sendBeacon?.(ENDPOINT, new Blob([corpo], { type: 'application/json' }))) return;
      } catch {}
      // Beacon recusado (fila cheia) ou inexistente.
      fetch(ENDPOINT, {
        method: 'POST',
        body: corpo,
        headers: { 'content-type': 'application/json' },
        keepalive: true,
      }).catch(() => {});
    }

    /* ---------------------------------------------- "continuar assistindo" */

    function salvarPosicao() {
      if (!comSom || op()?.retomar === false || v.ended || v.currentTime <= 0) return;
      ultimoSalvo = Date.now();
      gravar(chavePos, JSON.stringify({ t: Math.floor(v.currentTime) }));
    }

    function lerPosicao(): number {
      try {
        const bruto = ler(chavePos);
        const t = bruto ? Number((JSON.parse(bruto) as { t?: unknown }).t) : 0;
        return Number.isFinite(t) ? t : 0;
      } catch {
        return 0;
      }
    }

    function posicaoValida(t: number, d: number): boolean {
      return t > RETOMAR_MINIMO_S && (!d || t < d * RETOMAR_MAXIMO);
    }

    /* ------------------------------------------------------------ marcos */

    /** Segundo do marco; `undefined` se for por porcentagem e a duração ainda não for conhecida. */
    function alvo(m: MarcoPlayer): number | undefined {
      if (typeof m.segundos === 'number') return m.segundos;
      const d = duracao();
      if (typeof m.porcento === 'number' && d > 0) return (Math.min(100, Math.max(0, m.porcento)) / 100) * d;
      return undefined;
    }

    /**
     * Ordem importa: `aoChegar` roda ANTES de gravar `lembrar`, então quem
     * cuida do marco sabe se é a primeira vez (ver `marcosDoFunil`).
     */
    function disparar(i: number, { lembrar = true, evento = true } = {}) {
      const m = propsRef.current.marcos?.[i];
      if (!m || disparados.has(i)) return;
      disparados.add(i);
      try {
        m.aoChegar();
      } catch (erro) {
        console.error('[player] marco falhou', erro);
      }
      if (lembrar && m.lembrar) gravar(m.lembrar, '1');
      if (evento) registrar('marco', alvo(m) ?? v.currentTime);
    }

    /** `ate = Infinity` (fim do vídeo) dispara todos, inclusive os de porcentagem. */
    function conferirMarcos(ate: number) {
      propsRef.current.marcos?.forEach((m, i) => {
        const a = alvo(m);
        if (ate === Infinity || (a !== undefined && a <= ate)) disparar(i);
      });
    }

    /* ---------------------------------------------- telas por cima do vídeo */

    function atualizarGanchos(t: number) {
      const lista = op()?.ganchos ?? [];
      const ativos = lista.flatMap((g, i) => (t >= g.de && t <= g.ate ? [i] : [])).join(',');
      if (ativos === ganchosChave) return;
      ganchosChave = ativos;
      setGanchos(ativos ? ativos.split(',').map(Number) : []);
    }

    function thumbDaPausa(t: number): number {
      return (op()?.thumbs ?? []).findIndex(
        (x) => !x.noFim && typeof x.de === 'number' && typeof x.ate === 'number' && t >= x.de && t <= x.ate,
      );
    }

    function atualizarTempo() {
      const el = tempoRef.current;
      if (el) el.textContent = `${relogio(v.currentTime)} / ${relogio(duracao())}`;
    }

    /* ------------------------------------------------- imersivo e mini */

    function entrarImersivo() {
      if (imersivoAtivo || !imersivoPermitido(op())) return;
      if (miniAtivo) sairMini();
      imersivoAtivo = true;
      overflowAntes = document.documentElement.style.overflow;
      document.documentElement.style.overflow = 'hidden';
      setImersivo(true);
    }

    function sairImersivo() {
      if (!imersivoAtivo) return;
      imersivoAtivo = false;
      document.documentElement.style.overflow = overflowAntes;
      setImersivo(false);
    }

    function sairTelaCheiaNativa() {
      const d = document as DocFs;
      if (d.fullscreenElement) d.exitFullscreen?.().catch(() => {});
      else if (d.webkitFullscreenElement) d.webkitExitFullscreen?.();
    }

    function entrarMini() {
      if (miniAtivo || imersivoAtivo) return;
      miniAtivo = true;
      setMini(true);
    }

    function sairMini() {
      if (!miniAtivo) return;
      miniAtivo = false;
      setMini(false);
    }

    function conferirRolagem(t: number) {
      const r = op()?.rolarAte;
      if (rolou || !r || t < r.segundos) return;
      rolou = true;
      sairImersivo();
      sairTelaCheiaNativa();
      window.setTimeout(() => {
        const alvoEl = document.querySelector(r.seletor);
        if (!alvoEl) return;
        const suave = !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        alvoEl.scrollIntoView({ behavior: suave ? 'smooth' : 'auto', block: 'center' });
      }, ESPERA_ROLAGEM_MS);
    }

    /* ------------------------------------------------------------- barra */

    function desenhar() {
      if (!barra) return;
      const d = duracao();
      const p = d > 0 ? Math.min(1, Math.max(0, v.currentTime / d)) : 0;
      const alpha = op()?.controles?.barra ? 1 : (op()?.alphaBarra ?? 2);
      barra.style.transform = `scaleX(${1 - Math.pow(1 - p, alpha)})`;
    }

    function quadro() {
      desenhar();
      raf = comSom && !desmontado && !v.paused && !v.ended ? requestAnimationFrame(quadro) : 0;
    }

    function iniciarBarra() {
      if (comSom && !raf) raf = requestAnimationFrame(quadro);
    }

    /* ------------------------------------------------------------- fonte */

    function posicionar(t: number) {
      if (v.readyState >= 1) {
        v.currentTime = t;
        posPendente = null;
      } else {
        posPendente = t;
      }
    }

    function tocar(): Promise<void> {
      aplicarVelocidade();
      return v.play() ?? Promise.resolve();
    }

    /**
     * Sem saída nenhuma (HLS e MP4 falharam): libera tudo que os marcos
     * seguram. Perder a retenção é ruim; prender o comprador sem o botão da
     * oferta ou sem o "não quero" é pior.
     */
    function falhou() {
      if (falhouDeVez) return;
      falhouDeVez = true;
      console.error('[player] vídeo não carregou; liberando os marcos', { id });
      propsRef.current.marcos?.forEach((_, i) => disparar(i, { lembrar: false, evento: false }));
    }

    function trocarParaMp4() {
      const t = v.currentTime;
      const tocando = !v.paused;
      if (hls) {
        hls.destroy();
        hls = null;
      }
      if (!mp4 || fonte === 'mp4') return falhou();
      console.warn('[player] HLS falhou; usando o MP4', { id });
      fonte = 'mp4';
      v.src = mp4;
      if (t > 0) posPendente = t;
      if (tocando) tocar().catch(() => {});
    }

    function conectarFonte(): Promise<void> {
      if (esperaFonte) return esperaFonte;
      v.preload = 'metadata';
      if (v.canPlayType('application/vnd.apple.mpegurl')) {
        fonte = 'nativo';
        v.src = urlHls;
        fontePronta = true;
        esperaFonte = Promise.resolve();
        return esperaFonte;
      }
      esperaFonte = import('hls.js')
        .then(({ default: Hls }) => {
          if (desmontado) return;
          if (!Hls.isSupported()) return trocarParaMp4();
          const h = new Hls({ capLevelToPlayerSize: true });
          hls = h;
          fonte = 'hls';
          h.on(Hls.Events.ERROR, (_evento, dados) => {
            if (dados.fatal && hls === h) trocarParaMp4();
          });
          const q = op()?.qualidadeInicial;
          if (q && q !== 'auto') {
            // Os níveis do hls.js vêm do menor para o maior bitrate.
            h.on(Hls.Events.MANIFEST_PARSED, (_evento, dados) => {
              const n = dados.levels.length;
              if (n) h.startLevel = q === 'baixa' ? 0 : q === 'alta' ? n - 1 : Math.floor((n - 1) / 2);
            });
          }
          h.loadSource(urlHls);
          h.attachMedia(v);
        })
        .catch(() => {
          if (!desmontado) trocarParaMp4();
        })
        .finally(() => {
          fontePronta = true;
        });
      return esperaFonte;
    }

    /* ----------------------------------------------------------- fluxos */

    function iniciarPreview() {
      if (!(op()?.autoplayMudo ?? true) || faseAtual !== 'inicial' || retomarDe > 0) return;
      conectarFonte().then(() => {
        if (desmontado || faseAtual !== 'inicial' || !visivel) return;
        v.muted = true;
        posicionar(0);
        tocar().catch((erro) => {
          if (faseAtual === 'inicial' && erroDeAutoplay(erro)) mudarFase('parado');
        });
      });
    }

    /** Liga o som e toca a partir de `desde`. Sempre chamado num toque da pessoa. */
    function tocarComSom(desde: number, evento: TipoEventoPlayer | null) {
      const antes = v.currentTime;
      comSom = true;
      retomarDe = 0;
      pausadoPorRolagem = false;
      pausadoPelaAba = false;
      v.muted = false;
      setMudo(false);
      setThumb(-1);
      mudarFase('som');
      setPausado(false);
      posicionar(desde);
      if (evento) registrar(evento, evento === 'som' ? antes : desde);
      if (op()?.imersivo?.expandirAoTocar) entrarImersivo();
      const ir = () =>
        tocar().catch((erro) => {
          if (erroDeAutoplay(erro)) setPausado(true);
        });
      // Com a fonte pronta, o play sai dentro do gesto (iOS exige).
      if (fontePronta) ir();
      else
        conectarFonte().then(() => {
          if (!desmontado) ir();
        });
      iniciarBarra();
      desenhar();
      atualizarGanchos(desde);
      atualizarTempo();
    }

    /** Pula para `t` (controles, barra real, capítulos). Marcos no caminho disparam pelo `timeupdate`. */
    function irPara(t: number) {
      const d = duracao();
      const alvoT = Math.max(0, d > 0 ? Math.min(t, d - 0.25) : t);
      posicionar(alvoT);
      desenhar();
      atualizarTempo();
    }

    acoes.current = {
      ouvir: () => tocarComSom(0, 'som'),
      tocarDoZero: () => tocarComSom(0, 'play'),
      continuar: () => {
        const t = retomarDe;
        conferirMarcos(t);
        tocarComSom(t, null);
        registrar('retomou', t);
      },
      doInicio: () => {
        apagar(chavePos);
        tocarComSom(0, null);
        registrar('do_inicio', 0);
      },
      deNovo: () => tocarComSom(0, 'play'),
      alternar: () => {
        pausadoPelaAba = false;
        if (v.paused || v.ended) {
          if (v.ended) posicionar(0);
          tocar().catch(() => setPausado(true));
          registrar('play');
          if (op()?.imersivo?.expandirAoTocar) entrarImersivo();
        } else {
          if (op()?.bloquearPausa) return;
          v.pause();
          registrar('pausa');
        }
      },
      telaCheia: () => {
        if (imersivoPermitido(op())) {
          if (imersivoAtivo) sairImersivo();
          else entrarImersivo();
          return;
        }
        const d = document as DocFs;
        if (d.fullscreenElement || d.webkitFullscreenElement) return sairTelaCheiaNativa();
        const c = caixa as CaixaFs;
        const vi = v as VideoIos;
        if (c.requestFullscreen) c.requestFullscreen().catch(() => vi.webkitEnterFullscreen?.());
        else if (c.webkitRequestFullscreen) c.webkitRequestFullscreen();
        else vi.webkitEnterFullscreen?.(); // iPhone: só o vídeo vai para tela cheia.
      },
      sairImersivo,
      mudo: () => {
        v.muted = !v.muted;
        setMudo(v.muted);
      },
      pular: (s) => irPara(v.currentTime + s),
      irPara,
      irParaFracao: (f) => {
        const d = duracao();
        if (d > 0) irPara(Math.min(1, Math.max(0, f)) * d);
      },
      velocidade: () => {
        const lista = listaDeVelocidades(op());
        if (!lista.length) return;
        const atual = velocidadeEscolhida ?? op()?.velocidade ?? 1;
        // A próxima maior que a atual (a de partida, ex.: 1,2x, pode não estar na lista); depois da maior, volta à menor.
        const ordenada = [...lista].sort((a, b) => a - b);
        velocidadeEscolhida = ordenada.find((x) => x > atual + 0.01) ?? ordenada[0];
        aplicarVelocidade();
        setVelocidade(velocidadeEscolhida);
      },
      legendas: () => {
        const trilha = v.textTracks[0];
        if (!trilha) return;
        trilha.mode = trilha.mode === 'showing' ? 'hidden' : 'showing';
        setLegendasOn(trilha.mode === 'showing');
      },
      fecharMini: () => {
        miniFechado = true;
        sairMini();
        if (!v.paused) {
          v.pause();
          registrar('pausa');
        }
      },
      voltarAoLugar: () => {
        lugar.scrollIntoView({ behavior: 'smooth', block: 'center' });
      },
    };

    /* ------------------------------------------------- eventos do vídeo */

    ouvirEvento('loadedmetadata', () => {
      aplicarVelocidade();
      if (posPendente !== null) {
        v.currentTime = posPendente;
        posPendente = null;
      }
      // A posição salva passou de 95% da duração real: começa normal.
      if (faseAtual === 'retomar' && !posicaoValida(retomarDe, duracao())) {
        apagar(chavePos);
        retomarDe = 0;
        mudarFase((op()?.autoplayMudo ?? true) ? 'inicial' : 'parado');
        if (visivel) iniciarPreview();
      }
      setDuracaoTela(duracao());
      desenhar();
      atualizarTempo();
    });

    ouvirEvento('play', () => {
      aplicarVelocidade();
      if (faseAtual === 'som') {
        setPausado(false);
        setThumb(-1);
      }
      iniciarBarra();
    });

    ouvirEvento('playing', () => {
      if (faseAtual === 'inicial' && v.muted && !comSom) mudarFase('preview');
      if (faseAtual === 'preview' && !autoplayRegistrado) {
        autoplayRegistrado = true;
        registrar('autoplay', 0);
      }
    });

    ouvirEvento('pause', () => {
      if (faseAtual === 'som') {
        setPausado(true);
        salvarPosicao();
        if (!v.ended) setThumb(thumbDaPausa(v.currentTime));
        if (imersivoAtivo && op()?.imersivo?.minimizarAoPausar && !pausadoPelaAba) sairImersivo();
      }
      desenhar();
    });

    ouvirEvento('seeked', () => {
      desenhar();
      atualizarTempo();
      if (comSom) atualizarGanchos(v.currentTime);
    });

    ouvirEvento('volumechange', () => {
      if (comSom) setMudo(v.muted);
    });

    ouvirEvento('timeupdate', () => {
      // Só conta com som: o preview mudo nunca revela a oferta.
      if (!comSom) return;
      const t = v.currentTime;
      conferirMarcos(t);
      conferirRolagem(t);
      atualizarGanchos(t);
      atualizarTempo();
      if (!v.paused && !v.seeking) {
        const bloco = Math.floor(t / BLOCO_SEGUNDOS);
        if (bloco > 0 && !blocos.has(bloco)) {
          blocos.add(bloco);
          registrar('progresso', bloco * BLOCO_SEGUNDOS);
        }
        if (Date.now() - ultimoSalvo >= INTERVALO_SALVAR_MS) salvarPosicao();
      }
    });

    ouvirEvento('ended', () => {
      if (comSom) {
        registrar('fim', duracao());
        apagar(chavePos);
        gravar(chaveFim, '1');
        // O último `timeupdate` pode não alcançar um marco cravado no fim.
        conferirMarcos(Infinity);
        conferirRolagem(Infinity);
        if (op()?.repetirAoTerminar) {
          posicionar(0);
          tocar().catch(() => setPausado(true));
        } else {
          setPausado(true);
          sairImersivo();
          setThumb((op()?.thumbs ?? []).findIndex((x) => x.noFim));
          if (op()?.jaAssistiu) mudarFase('assistido');
        }
      }
      desenhar();
    });

    ouvirEvento('error', () => {
      if (fonte === 'nativo') trocarParaMp4();
      else if (fonte === 'mp4') falhou();
      // `hls`: quem decide é o evento de erro do hls.js.
    });

    /* ------------------------------------------------------ página/aba */

    const aoSair = () => {
      salvarPosicao();
      enviar();
    };
    const aoMudarVisibilidade = () => {
      if (document.visibilityState === 'hidden') {
        // Pausa inteligente: a aba sumiu com o vídeo tocando com som.
        if (op()?.pausaInteligente && comSom && !v.paused) {
          pausadoPelaAba = true;
          v.pause();
        }
        aoSair();
      } else if (pausadoPelaAba) {
        pausadoPelaAba = false;
        tocar().catch(() => setPausado(true));
      }
    };
    const aoTeclarNaPagina = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape' && imersivoAtivo) sairImersivo();
    };
    window.addEventListener('pagehide', aoSair);
    document.addEventListener('visibilitychange', aoMudarVisibilidade);
    document.addEventListener('keydown', aoTeclarNaPagina);
    limpar.push(() => {
      window.removeEventListener('pagehide', aoSair);
      document.removeEventListener('visibilitychange', aoMudarVisibilidade);
      document.removeEventListener('keydown', aoTeclarNaPagina);
    });

    /* ----------------------------------------------------------- montagem */

    // Marcos que já passaram numa visita anterior voltam revelados na hora.
    propsRef.current.marcos?.forEach((m, i) => {
      if (m.lembrar && ler(m.lembrar)) disparar(i, { lembrar: false, evento: false });
    });

    if (op()?.retomar !== false) {
      const t = lerPosicao();
      if (posicaoValida(t, propsRef.current.video.duracao ?? 0)) retomarDe = t;
      else if (t) apagar(chavePos);
    }

    // Manchetes que valem no segundo 0 aparecem antes do play.
    atualizarGanchos(0);

    if (retomarDe === 0 && op()?.jaAssistiu && ler(chaveFim)) mudarFase('assistido');

    const ioPerto = new IntersectionObserver(
      (entradas) => {
        if (!entradas.some((e) => e.isIntersecting)) return;
        ioPerto.disconnect();
        conectarFonte();
        timerEnvio = window.setInterval(enviar, INTERVALO_ENVIO_MS);
        if (retomarDe > 0 && faseAtual !== 'som') mudarFase('retomar');
      },
      { rootMargin: MARGEM_PERTO },
    );

    const ioVisivel = new IntersectionObserver(
      (entradas) => {
        const e = entradas[entradas.length - 1];
        const fracao = e.isIntersecting ? e.intersectionRatio : 0;
        if (fracao > 0 && !carregou) {
          carregou = true;
          registrar('carregou', 0);
        }
        visivel = fracao >= FRACAO_VISIVEL;
        if (fracao > 0) {
          sairMini();
          miniFechado = false;
        }
        if (visivel) {
          if (faseAtual === 'inicial') iniciarPreview();
          else if (faseAtual === 'preview' && pausadoPorRolagem) {
            pausadoPorRolagem = false;
            tocar().catch(() => {});
          }
        } else if (fracao === 0 && faseAtual === 'preview' && !v.paused) {
          // O preview mudo para fora da tela; com som, segue tocando (padrão de VSL).
          pausadoPorRolagem = true;
          v.pause();
        } else if (fracao === 0 && comSom && !v.paused && op()?.miniPlayer && !miniFechado) {
          entrarMini();
        }
      },
      { threshold: [0, 0.5] },
    );

    ioPerto.observe(lugar);
    ioVisivel.observe(lugar);

    return () => {
      desmontado = true;
      salvarPosicao();
      enviar();
      ioPerto.disconnect();
      ioVisivel.disconnect();
      window.clearInterval(timerEnvio);
      if (raf) cancelAnimationFrame(raf);
      if (imersivoAtivo) document.documentElement.style.overflow = overflowAntes;
      limpar.forEach((fn) => fn());
      if (hls) {
        hls.destroy();
        hls = null;
      } else if (fonte !== 'nenhuma') {
        v.removeAttribute('src');
        v.load();
      }
      acoes.current = null;
    };
  }, []);

  function aoTeclar(e: KeyboardEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget || (e.key !== ' ' && e.key !== 'Enter')) return;
    e.preventDefault();
    const a = acoes.current;
    if (!a) return;
    if (fase === 'som') a.alternar();
    else if (fase === 'preview') a.ouvir();
    else if (fase === 'assistido') a.deNovo();
    else if (fase === 'inicial' || fase === 'parado') a.tocarDoZero();
  }

  function aoTocarBarra(e: PointerEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    if (r.width > 0) acoes.current?.irParaFracao((e.clientX - r.left) / r.width);
  }

  const ctl = opcoes?.controles;
  const barraReal = Boolean(ctl?.barra);
  const velocidades = listaDeVelocidades(opcoes);
  const capitulos = (opcoes?.capitulos ?? []).filter((c) => Number.isFinite(c.segundos) && c.titulo);
  const legendas = opcoes?.legendas;
  const ta = opcoes?.textosAutoplay;
  const tr = opcoes?.textosRetomar;
  const ja = typeof opcoes?.jaAssistiu === 'object' ? opcoes.jaAssistiu : undefined;
  const listaGanchos = opcoes?.ganchos ?? [];
  const manchetes = ganchos.map((i) => listaGanchos[i]).filter((g) => g && g.lugar === 'acima');
  const minis = ganchos.map((i) => listaGanchos[i]).filter((g) => g && (g.lugar ?? 'video') === 'video');
  const imagemThumb = thumb >= 0 ? opcoes?.thumbs?.[thumb] : undefined;
  const temControles = Boolean(
    ctl?.tempo || ctl?.volume || ctl?.pular10 || velocidades.length || capitulos.length || legendas,
  );

  const vertical = video.proporcao < 1;
  const estilo = {
    '--pi-cor': opcoes?.cor ?? COR_PADRAO,
    '--pi-proporcao': String(video.proporcao),
  } as CSSProperties;

  const classes = ['pi'];
  if (vertical) classes.push('pi--vertical');
  if (mini) classes.push('pi--mini');
  if (imersivo) classes.push('pi--imersivo');
  if (barraReal) classes.push('pi--barra-real');

  return (
    <div className="pi-envoltorio" style={estilo}>
      {manchetes.length > 0 && (
        <div className="pi-manchetes" aria-live="polite">
          {manchetes.map((g) => (
            <p key={`${g.de}-${g.texto}`} className="pi-manchete">
              {g.texto}
            </p>
          ))}
        </div>
      )}

      <div
        ref={lugarRef}
        className={vertical ? 'pi-lugar pi-lugar--vertical' : 'pi-lugar'}
        style={{ aspectRatio: String(video.proporcao) }}
      >
        {mini && <p className="pi-lugar-aviso">O vídeo continua tocando no canto da tela</p>}

        <div
          ref={caixaRef}
          className={classes.join(' ')}
          data-fase={fase}
          role="region"
          aria-label={titulo}
          tabIndex={0}
          onKeyDown={aoTeclar}
        >
          <video
            ref={videoRef}
            className="pi-video"
            poster={video.poster}
            playsInline
            preload="none"
            disablePictureInPicture
            crossOrigin={legendas ? 'anonymous' : undefined}
            tabIndex={-1}
          >
            {legendas && (
              <track
                kind="subtitles"
                src={legendas.src}
                srcLang={legendas.idioma ?? 'pt'}
                label={legendas.rotulo ?? 'Português'}
                default={legendas.ligadas}
              />
            )}
          </video>

          <div
            className="pi-barra"
            aria-hidden={!barraReal}
            onPointerDown={barraReal && fase === 'som' ? aoTocarBarra : undefined}
          >
            <div ref={barraRef} className="pi-barra-fill" />
            {barraReal &&
              duracaoTela > 0 &&
              capitulos.map((c) => (
                <span
                  key={c.segundos}
                  className="pi-barra-capitulo"
                  style={{ left: `${Math.min(100, (c.segundos / duracaoTela) * 100)}%` }}
                />
              ))}
          </div>

          {fase === 'inicial' && (
            <button
              type="button"
              className="pi-camada"
              aria-label="Assistir ao vídeo"
              onClick={() => acoes.current?.tocarDoZero()}
            />
          )}

          {fase === 'parado' && (
            <button
              type="button"
              className="pi-camada pi-camada--escura"
              aria-label="Assistir ao vídeo"
              onClick={() => acoes.current?.tocarDoZero()}
            >
              <IconePlay />
            </button>
          )}

          {fase === 'preview' && (
            <button
              type="button"
              className="pi-camada pi-camada--aviso"
              aria-label={`${ta?.titulo ?? TEXTOS.autoplayTitulo}. ${ta?.acao ?? TEXTOS.autoplayAcao}`}
              onClick={() => acoes.current?.ouvir()}
            >
              <span className="pi-aviso">
                <span className="pi-aviso-titulo">{ta?.titulo ?? TEXTOS.autoplayTitulo}</span>
                <IconeSom />
                <span className="pi-aviso-acao">{ta?.acao ?? TEXTOS.autoplayAcao}</span>
              </span>
            </button>
          )}

          {fase === 'retomar' && (
            <div className="pi-camada pi-camada--escura pi-retomar">
              <p className="pi-retomar-titulo">{tr?.titulo ?? TEXTOS.retomarTitulo}</p>
              <button type="button" className="pi-botao" onClick={() => acoes.current?.continuar()}>
                {tr?.continuar ?? TEXTOS.retomarContinuar}
              </button>
              <button
                type="button"
                className="pi-botao pi-botao--secundario"
                onClick={() => acoes.current?.doInicio()}
              >
                {tr?.reiniciar ?? TEXTOS.retomarReiniciar}
              </button>
            </div>
          )}

          {fase === 'assistido' && (
            <div className="pi-camada pi-camada--escura pi-retomar">
              <p className="pi-retomar-titulo">{ja?.titulo ?? TEXTOS.assistidoTitulo}</p>
              <button type="button" className="pi-botao" onClick={() => acoes.current?.deNovo()}>
                {ja?.botao ?? TEXTOS.assistidoBotao}
              </button>
            </div>
          )}

          {fase === 'som' && (
            <>
              {imagemThumb && pausado && (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="pi-thumb" src={imagemThumb.imagem} alt={imagemThumb.alt ?? ''} />
              )}

              {minis.length > 0 && (
                <div className="pi-ganchos" aria-live="polite">
                  {minis.map((g) => (
                    <p key={`${g.de}-${g.texto}`} className="pi-gancho">
                      {g.texto}
                    </p>
                  ))}
                </div>
              )}

              <button
                type="button"
                className={pausado ? 'pi-camada pi-camada--pausado' : 'pi-camada'}
                aria-label={
                  mini ? 'Voltar para o vídeo' : pausado ? 'Continuar o vídeo' : 'Pausar o vídeo'
                }
                onClick={() => (mini ? acoes.current?.voltarAoLugar() : acoes.current?.alternar())}
              >
                {pausado && !imagemThumb && <IconePlay />}
              </button>

              {mini && (
                <button
                  type="button"
                  className="pi-fechar"
                  aria-label="Fechar o mini player"
                  onClick={() => acoes.current?.fecharMini()}
                >
                  <IconeFechar />
                </button>
              )}

              {imersivo && (
                <button
                  type="button"
                  className="pi-fechar"
                  aria-label="Sair da tela cheia"
                  onClick={() => acoes.current?.sairImersivo()}
                >
                  <IconeFechar />
                </button>
              )}

              {!mini && temControles && (
                <div className="pi-controles">
                  {ctl?.pular10 && (
                    <button type="button" className="pi-ctl" onClick={() => acoes.current?.pular(-10)}>
                      −10s
                    </button>
                  )}
                  {ctl?.pular10 && (
                    <button type="button" className="pi-ctl" onClick={() => acoes.current?.pular(10)}>
                      +10s
                    </button>
                  )}
                  {ctl?.volume && (
                    <button
                      type="button"
                      className="pi-ctl"
                      aria-label={mudo ? 'Ligar o som' : 'Tirar o som'}
                      aria-pressed={mudo}
                      onClick={() => acoes.current?.mudo()}
                    >
                      <IconeVolume mudo={mudo} />
                    </button>
                  )}
                  {velocidades.length > 0 && (
                    <button
                      type="button"
                      className="pi-ctl"
                      aria-label="Mudar a velocidade"
                      onClick={() => acoes.current?.velocidade()}
                    >
                      {`${velocidade ?? opcoes?.velocidade ?? 1}x`.replace('.', ',')}
                    </button>
                  )}
                  {legendas && (
                    <button
                      type="button"
                      className="pi-ctl"
                      aria-label="Legendas"
                      aria-pressed={legendasOn}
                      onClick={() => acoes.current?.legendas()}
                    >
                      CC
                    </button>
                  )}
                  {capitulos.length > 0 && (
                    <button
                      type="button"
                      className="pi-ctl"
                      aria-expanded={menuCapitulos}
                      onClick={() => setMenuCapitulos((x) => !x)}
                    >
                      Capítulos
                    </button>
                  )}
                  {ctl?.tempo && <span ref={tempoRef} className="pi-tempo" aria-hidden="true" />}
                </div>
              )}

              {!mini && menuCapitulos && capitulos.length > 0 && (
                <ul className="pi-capitulos">
                  {capitulos.map((c) => (
                    <li key={c.segundos}>
                      <button
                        type="button"
                        onClick={() => {
                          acoes.current?.irPara(c.segundos);
                          setMenuCapitulos(false);
                        }}
                      >
                        <span className="pi-capitulos-tempo">{relogio(c.segundos)}</span> {c.titulo}
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {!mini && (ctl?.telaCheia ?? true) && (
                <button
                  type="button"
                  className="pi-tela-cheia"
                  aria-label="Tela cheia"
                  onClick={() => acoes.current?.telaCheia()}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
                  </svg>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function IconePlay() {
  return (
    <span className="pi-play" aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l10.6-6.86a1 1 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14Z" />
      </svg>
    </span>
  );
}

function IconeSom() {
  return (
    <svg className="pi-som" viewBox="0 0 48 48" aria-hidden="true">
      <path className="pi-som-corpo" d="M8 18h8l11-9v30l-11-9H8z" />
      <path className="pi-som-onda pi-som-onda--1" d="M32 18a8 8 0 0 1 0 12" />
      <path className="pi-som-onda pi-som-onda--2" d="M36 13a15 15 0 0 1 0 22" />
    </svg>
  );
}

function IconeFechar() {
  return (
    <svg className="pi-icone" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function IconeVolume({ mudo }: { mudo: boolean }) {
  return (
    <svg className="pi-icone" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 9h4l5-4v14l-5-4H4z" />
      {mudo ? <path d="M17 9l4 6M21 9l-4 6" /> : <path d="M17 8.5a5 5 0 0 1 0 7" />}
    </svg>
  );
}
