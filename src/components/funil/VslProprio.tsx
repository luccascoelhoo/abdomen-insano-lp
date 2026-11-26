'use client';

import { useMemo } from 'react';
import { PlayerInsano } from '@/components/player/PlayerInsano';
import { marcosDoFunil } from '@/components/player/marcosDoFunil';
import { marcosDePixel, pixelsPorQuartil } from '@/components/player/pixelsDoPlayer';
import type { Vsl } from '@/content/desafio';

/** VSL no nosso player (R2), com os mesmos marcos do VTurb. Carregado sob demanda por `VslPlayer`. */
export function VslProprio({ vsl, proprio }: { vsl: Vsl; proprio: NonNullable<Vsl['proprio']> }) {
  const { playerId, delaySegundos, recusaSegundos } = vsl;
  const comPixels = Boolean(proprio.pixels);
  const marcos = useMemo(
    () => [
      ...marcosDoFunil({ playerId, delaySegundos, recusaSegundos }),
      ...(comPixels ? marcosDePixel(playerId, pixelsPorQuartil()) : []),
    ],
    [playerId, delaySegundos, recusaSegundos, comPixels],
  );
  const base = proprio.base.replace(/\/+$/, '');
  return (
    <div className="funil__vsl">
      <PlayerInsano
        titulo="Vídeo da oferta"
        video={{
          id: playerId,
          hls: `${base}/master.m3u8`,
          mp4: proprio.mp4 ? `${base}/${proprio.mp4}` : undefined,
          poster: `${base}/poster.jpg`,
          proporcao: proprio.proporcao,
          duracao: proprio.duracao,
        }}
        opcoes={{ velocidade: proprio.velocidade ?? 1.2, ...proprio.opcoes }}
        marcos={marcos}
        teste={proprio.teste}
        filtro={proprio.filtro}
      />
    </div>
  );
}
