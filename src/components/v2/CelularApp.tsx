'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

export type TelaApp = { src: string; alt: string };

/**
 * Um celular com as telas REAIS do Flameer passando sozinhas, como se alguém
 * estivesse navegando no app — o "motion" da apresentação do app.
 *
 * As telas vêm das capturas do emulador do projeto Flameer-Android (não são
 * maquetes). Cada tela entra deslizando da direita, como a navegação do app.
 * Só anima com o celular visível na tela e para para quem pediu menos
 * movimento no sistema (fica na primeira tela).
 */
export function CelularApp({
  telas,
  rotulo,
  intervalo = 2300,
  pontos = true,
  className = '',
}: {
  telas: readonly TelaApp[];
  /** Descrição do que o celular mostra, pra leitor de tela. */
  rotulo: string;
  intervalo?: number;
  pontos?: boolean;
  className?: string;
}) {
  const [ativa, setAtiva] = useState(0);
  const caixa = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = caixa.current;
    if (!el || telas.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let relogio: number | undefined;
    const iniciar = () => {
      if (relogio === undefined) {
        relogio = window.setInterval(() => setAtiva((a) => (a + 1) % telas.length), intervalo);
      }
    };
    const parar = () => {
      if (relogio !== undefined) {
        window.clearInterval(relogio);
        relogio = undefined;
      }
    };
    const observador = new IntersectionObserver(([e]) => (e.isIntersecting ? iniciar() : parar()), {
      threshold: 0.3,
    });
    observador.observe(el);
    return () => {
      observador.disconnect();
      parar();
    };
  }, [telas.length, intervalo]);

  const anterior = (ativa - 1 + telas.length) % telas.length;

  return (
    <div className={`v2-celular ${className}`} ref={caixa} role="img" aria-label={rotulo}>
      <div className="v2-celular__tela">
        {telas.map((t, i) => (
          <Image
            key={t.src}
            src={t.src}
            alt=""
            width={540}
            height={1200}
            sizes="240px"
            className={`v2-celular__quadro${i === ativa ? ' is-ativa' : i === anterior && telas.length > 1 ? ' is-saindo' : ''}`}
          />
        ))}
      </div>
      {pontos && telas.length > 1 && (
        <div className="v2-celular__pontos" aria-hidden="true">
          {telas.map((t, i) => (
            <span key={t.src} className={i === ativa ? 'is-ativa' : undefined} />
          ))}
        </div>
      )}
    </div>
  );
}
