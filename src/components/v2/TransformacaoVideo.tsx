'use client';

import { useEffect, useRef } from 'react';

/**
 * O vídeo da transformação (dia 01, dia 42 e 1 ano).
 *
 * Com `autoPlay` o navegador baixava o arquivo inteiro (~1 MB) na abertura da
 * página, brigando com a primeira tela — o maior item da página no celular. Aqui
 * ele só baixa e toca quando chega perto da tela, e pausa quando sai (mesmo
 * jeito do `CelularVideo`). A capa (`poster`) aparece até lá.
 */
export function TransformacaoVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    const observador = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          // A capa também espera: 60 KB que a primeira tela não precisa.
          if (!v.poster) v.poster = '/video/transformacao-poster.webp';
          v.play().catch(() => {});
        }
        else v.pause();
      },
      // Começa a baixar um pouco antes de entrar na tela.
      { rootMargin: '300px 0px', threshold: 0 },
    );
    observador.observe(v);
    return () => observador.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      className="v2-transformacao"
      loop
      muted
      playsInline
      preload="none"
      aria-label="Dia 01, dia 42 e 1 ano: a transformação de quem faz o desafio"
    >
      <source src="/video/transformacao.mp4" type="video/mp4" />
      <source src="/video/transformacao.webm" type="video/webm" />
    </video>
  );
}
