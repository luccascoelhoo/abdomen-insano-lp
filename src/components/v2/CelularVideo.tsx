'use client';

import { useEffect, useRef } from 'react';

/**
 * Um iPhone com uma gravação real do app rodando em loop.
 *
 * As gravações vieram em GIF (6 a 9 MB cada) e viraram vídeo mudo (~150 a
 * 350 KB). O vídeo só baixa e toca quando o celular entra na tela, e pausa
 * quando sai. A gravação já tem a ilha dinâmica do iPhone, então a moldura
 * não desenha outra.
 *
 * Toca mesmo com "reduzir movimento" ligado: no Windows essa opção vem
 * ligada sempre que as animações do sistema estão desativadas, e aí o vídeo
 * ficava parado na capa em muito computador. Em troca, um toque no celular
 * pausa e retoma. Se o navegador barrar o autoplay (modo de economia de
 * energia, por exemplo), o vídeo tenta de novo no primeiro toque ou tecla.
 */
export function CelularVideo({ video, rotulo }: { video: string; rotulo: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const pausadoPelaPessoa = useRef(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;

    const tentarDeNovo = () => {
      if (!pausadoPelaPessoa.current) v.play().catch(() => {});
    };
    const tocar = () =>
      v.play().catch(() => {
        window.addEventListener('pointerdown', tentarDeNovo, { once: true });
        window.addEventListener('keydown', tentarDeNovo, { once: true });
      });

    const observador = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) v.pause();
        else if (!pausadoPelaPessoa.current) tocar();
      },
      { threshold: 0.25 },
    );
    observador.observe(v);
    return () => {
      observador.disconnect();
      window.removeEventListener('pointerdown', tentarDeNovo);
      window.removeEventListener('keydown', tentarDeNovo);
    };
  }, []);

  const alternar = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) {
      pausadoPelaPessoa.current = false;
      v.play().catch(() => {});
    } else {
      pausadoPelaPessoa.current = true;
      v.pause();
    }
  };

  return (
    <div className="v2-iphone" role="img" aria-label={rotulo} onClick={alternar}>
      <div className="v2-iphone__tela">
        {/* mp4 (H.264) primeiro: toca em qualquer navegador, inclusive o Safari do Mac. */}
        <video ref={ref} muted loop playsInline preload="none" poster={`/video/app/${video}.webp`} aria-hidden="true">
          <source src={`/video/app/${video}.mp4`} type="video/mp4" />
          <source src={`/video/app/${video}.webm`} type="video/webm" />
        </video>
      </div>
    </div>
  );
}
