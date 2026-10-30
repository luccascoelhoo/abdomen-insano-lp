'use client';

import { useEffect, useRef } from 'react';

/**
 * Um iPhone com uma gravação real do app rodando em loop.
 *
 * As gravações vieram em GIF (6 a 9 MB cada) e viraram vídeo mudo (~150 a
 * 350 KB). O vídeo só baixa e toca quando o celular entra na tela, e pausa
 * quando sai; quem pediu menos movimento no sistema fica no primeiro quadro.
 * A gravação já tem a ilha dinâmica do iPhone, então a moldura não desenha
 * outra.
 */
export function CelularVideo({ video, rotulo }: { video: string; rotulo: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const observador = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.25 },
    );
    observador.observe(v);
    return () => observador.disconnect();
  }, []);

  return (
    <div className="v2-iphone" role="img" aria-label={rotulo}>
      <div className="v2-iphone__tela">
        <video ref={ref} muted loop playsInline preload="none" poster={`/video/app/${video}.webp`} aria-hidden="true">
          <source src={`/video/app/${video}.webm`} type="video/webm" />
          <source src={`/video/app/${video}.mp4`} type="video/mp4" />
        </video>
      </div>
    </div>
  );
}
