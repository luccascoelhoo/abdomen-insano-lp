'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { IMAGENS_PRONTAS } from '@/lib/flags';

const DIAS = Array.from({ length: 42 }, (_, i) => i + 1);

/**
 * Distância de rolagem em que o wipe completo acontece. Escolhido perto de
 * uma tela inteira de scroll pra sensação de "chegada" ser cinematográfica.
 */
const WIPE_SCROLL_PX = 720;
/** Fração do wipe que cada célula ocupa. 0.22 dá cascata sem estourar 1.0. */
const STEP = 0.018;
const WINDOW = 0.22;

type Props = {
  src?: string;
  alt?: string;
};

/**
 * Foto do "resultado" com a malha de 42 dias caindo por cima conforme scroll.
 *
 * Conceito narrativo: a pessoa mostrada é o que você pode ser. Cada quadrado
 * é um dia — a malha se completa enquanto você desce a página, como quem
 * termina 42 dias.
 *
 * Sem JS ou com prefers-reduced-motion: mostra foto + malha completa.
 */
export function HeroFoto({ src = '/img/hero-atleta.jpg', alt = 'Resultado do desafio' }: Props) {
  const malhaRef = useRef<HTMLDivElement>(null);
  const fotoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const malha = malhaRef.current;
    const foto = fotoRef.current;
    if (!malha) return;

    const celulas = Array.from(malha.querySelectorAll<HTMLElement>('.c'));

    if (semMovimento) {
      celulas.forEach((c) => c.classList.add('on'));
      return;
    }

    let pedido = 0;
    const aplicar = () => {
      pedido = 0;
      const progresso = Math.max(0, Math.min(1, window.scrollY / WIPE_SCROLL_PX));

      celulas.forEach((c, i) => {
        const inicio = i * STEP;
        const fim = inicio + WINDOW;
        const t = (progresso - inicio) / (fim - inicio);
        const clamped = Math.max(0, Math.min(1, t));
        // Ease-out cúbico dá sensação de "encaixar" no lugar.
        const suave = 1 - Math.pow(1 - clamped, 3);
        c.style.opacity = String(suave);
        c.style.transform = `scale(${0.6 + 0.4 * suave})`;
      });

      if (foto) {
        // Parallax leve — foto se afasta enquanto o scroll acontece.
        const escala = 1.08 - 0.08 * Math.min(1, window.scrollY / 900);
        const deslocY = Math.min(1, window.scrollY / 900) * 20;
        foto.style.transform = `translateY(${deslocY}px) scale(${escala})`;
      }
    };

    const aoRolar = () => {
      if (pedido) return;
      pedido = requestAnimationFrame(aplicar);
    };

    aplicar();
    window.addEventListener('scroll', aoRolar, { passive: true });
    window.addEventListener('resize', aoRolar);
    return () => {
      window.removeEventListener('scroll', aoRolar);
      window.removeEventListener('resize', aoRolar);
      if (pedido) cancelAnimationFrame(pedido);
    };
  }, []);

  return (
    <div className="herofoto">
      <div className="herofoto__topo">
        <span>Malha do desafio</span>
        <span>06 semanas</span>
      </div>

      <div className="herofoto__quadro">
        {IMAGENS_PRONTAS ? (
          <div className="herofoto__img" ref={fotoRef}>
            <Image src={src} alt={alt} fill sizes="(min-width: 900px) 44vw, 100vw" priority />
          </div>
        ) : (
          <div className="herofoto__placeholder" aria-hidden="true" ref={fotoRef}>
            <div className="herofoto__placeholder-texto">
              <b>Sua foto aqui</b>
              <span>coloque em /public/img/hero-atleta.jpg</span>
            </div>
          </div>
        )}

        <div className="herofoto__malha" aria-hidden="true" ref={malhaRef}>
          {DIAS.map((dia) => (
            <span
              key={dia}
              className={dia === 42 ? 'c c--last' : 'c'}
              /* Estado inicial escondido para o SSR: sem JS a chave abaixo
                 continua funcionando (media query prefers-reduced-motion). */
              style={{ opacity: 0, transform: 'scale(0.6)' }}
            >
              {String(dia).padStart(2, '0')}
            </span>
          ))}
        </div>
      </div>

      <p className="herofoto__pe">
        Cada quadrado é um dia marcado no app. O último é o dia em que ninguém te reconhece.
      </p>
    </div>
  );
}
