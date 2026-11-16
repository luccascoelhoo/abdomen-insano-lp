'use client';

import { useMemo } from 'react';
import { PlayerInsano } from '@/components/player/PlayerInsano';
import { marcosDoFunil } from '@/components/player/marcosDoFunil';
import type { OpcoesPlayer, VideoInsano } from '@/components/player/tipos';

const VIDEO: VideoInsano = {
  id: 'teste-downsell',
  hls: '/videos-teste/downsell/master.m3u8',
  mp4: '/videos-teste/downsell/downsell.mp4',
  poster: '/videos-teste/downsell/poster.jpg',
  proporcao: 404 / 720,
  duracao: 108.5,
};

const OPCOES: OpcoesPlayer = { velocidade: 1.2 };

/**
 * Os marcos levam funções, então moram num componente de cliente: uma página
 * de servidor não pode passar `aoChegar` para o player.
 */
export function TestePlayer() {
  const marcos = useMemo(
    () => marcosDoFunil({ playerId: 'teste-downsell', delaySegundos: 60, recusaSegundos: 107 }),
    [],
  );

  return (
    <main style={{ padding: '32px 16px 120px', background: '#000', minHeight: '100vh', color: '#f2f2f2' }}>
      <h1 style={{ textAlign: 'center', fontSize: '1.2rem', margin: '0 0 24px' }}>Teste do Player Insano</h1>

      <PlayerInsano video={VIDEO} opcoes={OPCOES} marcos={marcos} titulo="Vídeo de teste" />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginTop: 32 }}>
        <a
          href="#comprar"
          className="esconder"
          style={{
            padding: '16px 32px',
            borderRadius: 999,
            background: '#16a34a',
            color: '#fff',
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          Quero o meu agora (aparece aos 60 s)
        </a>
        <a href="#recusar" className="esconder-fim" style={{ color: '#aaa', fontSize: '0.9rem' }}>
          Não quero, obrigado (aparece aos 107 s + 4 s)
        </a>
      </div>
    </main>
  );
}
