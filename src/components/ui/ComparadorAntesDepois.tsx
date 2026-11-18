'use client';

import Image from 'next/image';
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import './ComparadorAntesDepois.css';

/*
 * Limites da divisória (em % da largura). As fotos são montagens com uma
 * medalha no meio: na metade ANTES ela ocupa de 78,6% a 100% da metade e na
 * DEPOIS de 0% a 21,4%. Travando entre 22% e 78%, a meia medalha nunca aparece.
 */
const MIN = 22;
const MAX = 78;
const INICIO = 50;
const PASSO = 4;
/** Quanto o dedo anda (px) antes de decidirmos se é arraste ou rolagem. */
const LIMIAR = 6;
/** Dica de uso ao entrar na tela: 50 → 64 → 36 → 50 em ~1,6 s. */
const DICA_QUADROS = [50, 64, 36, 50] as const;
const DICA_DURACAO = 1600;

/** Sem medalha na montagem (ex.: antes e depois do Igor), o arraste vai de 4% a 96%. */
const MIN_LIVRE = 4;
const MAX_LIVRE = 96;
const suave = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

type Props = {
  /** Montagem quadrada: ANTES na metade esquerda, DEPOIS na direita. */
  src: string;
  alt: string;
  rotuloAntes?: string;
  rotuloDepois?: string;
  /** Só para o primeiro card visível sem rolar (pré-carrega a imagem). */
  prioridade?: boolean;
  /** Linha opcional sob o card (ex.: "Aluno do Desafio Abdômen Insano"). */
  legenda?: ReactNode;
  dica?: string;
  /** Atraso (ms) da dica animada, para escalonar cards lado a lado. */
  atrasoDica?: number;
  /** Largura em que a imagem é desenhada (é o dobro da largura do card). */
  sizes?: string;
  /** Faixa vertical mostrada (0% topo, 100% pé). Padrão 45%: tronco e abdômen. */
  focoY?: string;
  /**
   * Largura / altura de CADA metade do card (ex.: '3 / 4'). Padrão 2 / 3. Use a
   * mesma proporção das metades da montagem para não cortar nada.
   */
  proporcao?: string;
  /** Montagem SEM a medalha no meio: libera o arraste (4% a 96%). */
  semMedalha?: boolean;
};

/**
 * Comparador antes/depois "arraste para revelar".
 *
 * As duas camadas usam a MESMA imagem (um download só): a de baixo mostra a
 * metade esquerda ampliada, a de cima a metade direita, recortada por
 * `clip-path` a partir da divisória. Neutro de cor: funciona em fundo claro e
 * escuro. Proporção e enquadramento vertical ajustáveis por CSS
 * (`--comparador-proporcao`, `--comparador-foco-y`).
 *
 * Toque: `touch-action: pan-y` deixa a rolagem vertical com o navegador; só um
 * gesto horizontal vira arraste, e um toque simples pula a divisória.
 */
export function ComparadorAntesDepois({
  src,
  alt,
  rotuloAntes = 'ANTES',
  rotuloDepois = 'DEPOIS',
  prioridade = false,
  focoY,
  proporcao,
  semMedalha = false,
  legenda,
  dica = 'Arraste para comparar',
  atrasoDica = 300,
  sizes = '(max-width: 460px) 200vw, 840px',
}: Props) {
  const [pos, setPos] = useState(INICIO);
  const caixa = useRef<HTMLDivElement>(null);
  const alca = useRef<HTMLDivElement>(null);
  const gesto = useRef<{ id: number; x: number; y: number; arrastando: boolean } | null>(null);
  /** A pessoa já mexeu: a dica não roda (ou para no meio). */
  const mexeu = useRef(false);
  const quadro = useRef(0);

  useEffect(() => {
    const el = caixa.current;
    if (!el || !('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let espera = 0;
    const animar = () => {
      const inicio = performance.now();
      const segmentos = DICA_QUADROS.length - 1;
      const passo = (agora: number) => {
        if (mexeu.current) return;
        const t = Math.min(1, (agora - inicio) / DICA_DURACAO);
        const i = Math.min(segmentos - 1, Math.floor(t * segmentos));
        const de = DICA_QUADROS[i];
        const para = DICA_QUADROS[i + 1];
        setPos(de + (para - de) * suave(t * segmentos - i));
        if (t < 1) quadro.current = requestAnimationFrame(passo);
      };
      quadro.current = requestAnimationFrame(passo);
    };

    const io = new IntersectionObserver(
      (entradas) => {
        if (!entradas.some((e) => e.isIntersecting)) return;
        io.disconnect();
        if (!mexeu.current) espera = window.setTimeout(animar, atrasoDica);
      },
      { threshold: 0.6 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      window.clearTimeout(espera);
      cancelAnimationFrame(quadro.current);
    };
  }, [atrasoDica]);

  function pararDica() {
    mexeu.current = true;
    cancelAnimationFrame(quadro.current);
  }

  const min = semMedalha ? MIN_LIVRE : MIN;
  const max = semMedalha ? MAX_LIVRE : MAX;
  const limitar = (v: number) => Math.min(max, Math.max(min, v));

  function irPara(clientX: number) {
    const r = caixa.current?.getBoundingClientRect();
    if (!r || r.width === 0) return;
    setPos(limitar(((clientX - r.left) / r.width) * 100));
  }

  function aoPressionar(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    pararDica();
    gesto.current = { id: e.pointerId, x: e.clientX, y: e.clientY, arrastando: false };
    // Mouse: arrasta na hora. Dedo/caneta: espera para ver se é rolagem.
    if (e.pointerType === 'mouse') {
      gesto.current.arrastando = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      alca.current?.focus({ preventScroll: true });
      irPara(e.clientX);
    }
  }

  function aoMover(e: PointerEvent<HTMLDivElement>) {
    const g = gesto.current;
    if (!g || g.id !== e.pointerId) return;
    if (!g.arrastando) {
      const dx = Math.abs(e.clientX - g.x);
      const dy = Math.abs(e.clientY - g.y);
      if (dx < LIMIAR && dy < LIMIAR) return;
      if (dx <= dy) {
        gesto.current = null; // gesto vertical: é a página rolando
        return;
      }
      g.arrastando = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    irPara(e.clientX);
  }

  function aoSoltar(e: PointerEvent<HTMLDivElement>) {
    const g = gesto.current;
    if (!g || g.id !== e.pointerId) return;
    if (!g.arrastando) irPara(e.clientX); // toque simples: pula a divisória
    gesto.current = null;
  }

  function aoCancelar() {
    gesto.current = null;
  }

  function aoTeclar(e: KeyboardEvent<HTMLDivElement>) {
    let proximo: (atual: number) => number;
    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        proximo = (atual) => atual - PASSO;
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        proximo = (atual) => atual + PASSO;
        break;
      case 'Home':
        proximo = () => min;
        break;
      case 'End':
        proximo = () => max;
        break;
      default:
        return;
    }
    e.preventDefault();
    pararDica();
    setPos((atual) => limitar(proximo(Math.round(atual))));
  }

  const valor = Math.round(pos);

  return (
    <figure
      className="comparador"
      style={
        {
          '--comparador-pos': `${pos}%`,
          ...(focoY ? { '--comparador-foco-y': focoY } : {}),
          ...(proporcao ? { '--comparador-proporcao': proporcao } : {}),
        } as CSSProperties
      }
    >
      <div
        ref={caixa}
        className="comparador__caixa"
        onPointerDown={aoPressionar}
        onPointerMove={aoMover}
        onPointerUp={aoSoltar}
        onPointerCancel={aoCancelar}
        onLostPointerCapture={aoCancelar}
      >
        <div className="comparador__camada">
          <Image
            src={src}
            alt={alt}
            width={1000}
            height={1000}
            sizes={sizes}
            preload={prioridade}
            draggable={false}
            className="comparador__img comparador__img--antes"
          />
          <span className="comparador__rotulo comparador__rotulo--antes" aria-hidden="true">
            {rotuloAntes}
          </span>
        </div>
        <div className="comparador__camada comparador__camada--depois" aria-hidden="true">
          <Image
            src={src}
            alt=""
            width={1000}
            height={1000}
            sizes={sizes}
            loading={prioridade ? 'eager' : undefined}
            draggable={false}
            className="comparador__img comparador__img--depois"
          />
          <span className="comparador__rotulo comparador__rotulo--depois">{rotuloDepois}</span>
        </div>
        <div
          ref={alca}
          className="comparador__alca"
          role="slider"
          tabIndex={0}
          aria-label="Comparar antes e depois: arraste"
          aria-orientation="horizontal"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={valor}
          aria-valuetext={`${valor}% ${rotuloAntes.toLowerCase()}, ${100 - valor}% ${rotuloDepois.toLowerCase()}`}
          onKeyDown={aoTeclar}
        >
          <span className="comparador__botao" aria-hidden="true">
            <IconeSetas />
          </span>
        </div>
      </div>
      <figcaption className="comparador__legenda">
        {legenda ? <span className="comparador__titulo">{legenda}</span> : null}
        <span className="comparador__dica">
          <IconeSetas />
          {dica}
        </span>
      </figcaption>
    </figure>
  );
}

function IconeSetas() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M9 7l-5 5 5 5M15 7l5 5-5 5M4 12h16"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
