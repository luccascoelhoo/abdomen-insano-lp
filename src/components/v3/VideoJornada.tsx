'use client';

import { useEffect, useRef } from 'react';

/**
 * O vídeo da jornada (dia 01, dia 42, 1 ano), mudo e em loop.
 *
 * Sem `autoPlay` de propósito: com ele o navegador ignora o `preload` e baixa
 * o arquivo inteiro (~1 MB) já na abertura, disputando banda com a foto do
 * topo. Aqui ele só carrega e toca quando entra na tela, e pausa quando sai.
 * Quem pediu menos movimento no sistema vê só o pôster.
 */
export function VideoJornada({ poster, webm, mp4, rotulo }: { poster: string; webm: string; mp4: string; rotulo: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const observador = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.4 },
    );
    observador.observe(video);
    return () => observador.disconnect();
  }, []);

  return (
    <video ref={ref} className="v3-video" loop muted playsInline preload="none" poster={poster} aria-label={rotulo}>
      <source src={webm} type="video/webm" />
      <source src={mp4} type="video/mp4" />
    </video>
  );
}
