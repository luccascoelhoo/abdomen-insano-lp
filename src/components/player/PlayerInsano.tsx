'use client';

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import type HlsType from 'hls.js';
import { caminhoDaPagina } from '@/lib/pagina-de-origem';
import { lerUtm } from '@/lib/utm';
import {
  BLOCO_SEGUNDOS,
  type EventoPlayer,
  type LotePlayer,
  type PropsPlayer,
  type TipoEventoPlayer,
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
 *  - `som`: assistindo com som — toque pausa/continua, sem barra de avanço.
 *
 * Nada acontece antes de o player chegar perto da tela: nem hls.js, nem
 * metadados, nem métricas. O tempo do vídeo vive em refs; o React só
 * re-renderiza quando a fase muda ou quando pausa/continua.
 */

type Fase = 'inicial' | 'preview' | 'parado' | 'retomar' | 'som';

interface Acoes {
  ouvir: () => void;
  tocarDoZero: () => void;
  continuar: () => void;
  doInicio: () => void;
  alternar: () => void;
  telaCheia: () => void;
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

/* ------------------------------------------------------------ componente */

export function PlayerInsano(props: PropsPlayer) {
  // Trocar de vídeo = player novo do zero (fase, fonte, marcos, métricas).
  const { id, hls, mp4 } = props.video;
  return <Nucleo key={`${id}|${hls}|${mp4 ?? ''}`} {...props} />;
}

function Nucleo({ video, opcoes, marcos, titulo }: PropsPlayer) {
  const [fase, setFase] = useState<Fase>((opcoes?.autoplayMudo ?? true) ? 'inicial' : 'parado');
  const [pausado, setPausado] = useState(false);

  const caixaRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const barraRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef({ video, opcoes, marcos });
  const acoes = useRef<Acoes | null>(null);
  const faseRef = useRef<Fase>(fase);

  // Os objetos de props mudam de identidade a cada render do pai; o player lê
  // sempre a versão mais nova sem reiniciar nada.
  useEffect(() => {
    propsRef.current = { video, opcoes, marcos };
  });

  useEffect(() => {
    const elVideo = videoRef.current;
    const elCaixa = caixaRef.current;
    const barra = barraRef.current;
    if (!elVideo || !elCaixa) return;
    // Tipos sem `null`: as funções abaixo são declarações (hoisted) e o TS
    // não estreitaria o tipo dentro delas.
    const v: HTMLVideoElement = elVideo;
    const caixa: HTMLDivElement = elCaixa;

    const { id, hls: urlHls, mp4 } = propsRef.current.video;
    const op = () => propsRef.current.opcoes;
    const chavePos = `pi_pos_${id}`;
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
    let falhouDeVez = false;
    let retomarDe = 0;
    let ultimoSalvo = 0;
    let raf = 0;
    let timerEnvio = 0;
    let desmontado = false;
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
      const r = op()?.velocidade ?? 1;
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
      if (evento) registrar('marco', m.segundos);
    }

    function conferirMarcos(ate: number) {
      propsRef.current.marcos?.forEach((m, i) => {
        if (m.segundos <= ate) disparar(i);
      });
    }

    /* ------------------------------------------------------------- barra */

    function desenhar() {
      if (!barra) return;
      const d = duracao();
      const p = d > 0 ? Math.min(1, Math.max(0, v.currentTime / d)) : 0;
      const alpha = op()?.alphaBarra ?? 2;
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
      v.muted = false;
      mudarFase('som');
      setPausado(false);
      posicionar(desde);
      if (evento) registrar(evento, evento === 'som' ? antes : desde);
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
      alternar: () => {
        if (v.paused || v.ended) {
          tocar().catch(() => setPausado(true));
          registrar('play');
        } else {
          v.pause();
          registrar('pausa');
        }
      },
      telaCheia: () => {
        const d = document as DocFs;
        if (d.fullscreenElement || d.webkitFullscreenElement) {
          if (d.exitFullscreen) d.exitFullscreen().catch(() => {});
          else d.webkitExitFullscreen?.();
          return;
        }
        const c = caixa as CaixaFs;
        const vi = v as VideoIos;
        if (c.requestFullscreen) c.requestFullscreen().catch(() => vi.webkitEnterFullscreen?.());
        else if (c.webkitRequestFullscreen) c.webkitRequestFullscreen();
        else vi.webkitEnterFullscreen?.(); // iPhone: só o vídeo vai para tela cheia.
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
      desenhar();
    });

    ouvirEvento('play', () => {
      aplicarVelocidade();
      if (faseAtual === 'som') setPausado(false);
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
      }
      desenhar();
    });

    ouvirEvento('seeked', desenhar);

    ouvirEvento('timeupdate', () => {
      // Só conta com som: o preview mudo nunca revela a oferta.
      if (!comSom) return;
      const t = v.currentTime;
      conferirMarcos(t);
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
        // O último `timeupdate` pode não alcançar um marco cravado no fim.
        conferirMarcos(Infinity);
        setPausado(true);
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
      if (document.visibilityState === 'hidden') aoSair();
    };
    window.addEventListener('pagehide', aoSair);
    document.addEventListener('visibilitychange', aoMudarVisibilidade);
    limpar.push(() => {
      window.removeEventListener('pagehide', aoSair);
      document.removeEventListener('visibilitychange', aoMudarVisibilidade);
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
        }
      },
      { threshold: [0, 0.5] },
    );

    ioPerto.observe(caixa);
    ioVisivel.observe(caixa);

    return () => {
      desmontado = true;
      salvarPosicao();
      enviar();
      ioPerto.disconnect();
      ioVisivel.disconnect();
      window.clearInterval(timerEnvio);
      if (raf) cancelAnimationFrame(raf);
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
    else if (fase === 'inicial' || fase === 'parado') a.tocarDoZero();
  }

  const estilo = {
    aspectRatio: String(video.proporcao),
    '--pi-cor': opcoes?.cor ?? COR_PADRAO,
  } as CSSProperties;

  return (
    <div
      ref={caixaRef}
      className={video.proporcao < 1 ? 'pi pi--vertical' : 'pi'}
      data-fase={fase}
      style={estilo}
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
        tabIndex={-1}
      />

      <div className="pi-barra" aria-hidden="true">
        <div ref={barraRef} className="pi-barra-fill" />
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
          aria-label="Seu vídeo já começou. Clique para ouvir"
          onClick={() => acoes.current?.ouvir()}
        >
          <span className="pi-aviso">
            <span className="pi-aviso-titulo">Seu vídeo já começou</span>
            <IconeSom />
            <span className="pi-aviso-acao">Clique para ouvir</span>
          </span>
        </button>
      )}

      {fase === 'retomar' && (
        <div className="pi-camada pi-camada--escura pi-retomar">
          <p className="pi-retomar-titulo">Você já começou a assistir esse vídeo</p>
          <button type="button" className="pi-botao" onClick={() => acoes.current?.continuar()}>
            Continuar assistindo
          </button>
          <button
            type="button"
            className="pi-botao pi-botao--secundario"
            onClick={() => acoes.current?.doInicio()}
          >
            Assistir do início
          </button>
        </div>
      )}

      {fase === 'som' && (
        <>
          <button
            type="button"
            className={pausado ? 'pi-camada pi-camada--pausado' : 'pi-camada'}
            aria-label={pausado ? 'Continuar o vídeo' : 'Pausar o vídeo'}
            onClick={() => acoes.current?.alternar()}
          >
            {pausado && <IconePlay />}
          </button>
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
        </>
      )}
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
