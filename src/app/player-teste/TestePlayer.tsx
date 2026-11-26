'use client';

import { useMemo } from 'react';
import { PlayerInsano } from '@/components/player/PlayerInsano';
import { marcosDoFunil } from '@/components/player/marcosDoFunil';
import { marcosDePixel, pixelsPorQuartil } from '@/components/player/pixelsDoPlayer';
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

/** `?modo=completo`: todos os recursos novos ligados, para testar de uma vez. */
const OPCOES_COMPLETAS: OpcoesPlayer = {
  velocidade: 1.2,
  jaAssistiu: true,
  pausaInteligente: true,
  rolarAte: { segundos: 62, seletor: '#comprar' },
  qualidadeInicial: 'media',
  ganchos: [
    { de: 0, ate: 30, texto: 'Assista até o final: o desconto aparece no vídeo', lugar: 'acima' },
    { de: 10, ate: 18, texto: 'Presta atenção nesta parte 👀' },
    { de: 50, ate: 58, texto: 'O preço vem agora' },
  ],
  thumbs: [
    {
      de: 0,
      ate: 108,
      imagem: '/videos-teste/downsell/poster.jpg',
      alt: 'Continue assistindo: falta pouco para o desconto',
    },
  ],
  controles: { tempo: true, volume: true, pular10: true, velocidade: true, barra: true },
  capitulos: [
    { segundos: 0, titulo: 'Começo' },
    { segundos: 30, titulo: 'O que você recebe' },
    { segundos: 54, titulo: 'O preço' },
  ],
  imersivo: { celular: true, desktop: false, expandirAoTocar: false, minimizarAoPausar: true },
  miniPlayer: true,
};

/**
 * Os marcos levam funções, então moram num componente de cliente: uma página
 * de servidor não pode passar `aoChegar` para o player.
 */
export function TestePlayer({ completo, filtro }: { completo: boolean; filtro?: boolean }) {
  const marcos = useMemo(
    () => [
      ...marcosDoFunil({ playerId: 'teste-downsell', delaySegundos: 60, recusaSegundos: 107 }),
      ...(completo ? marcosDePixel('teste-downsell', pixelsPorQuartil()) : []),
    ],
    [completo],
  );

  return (
    <main style={{ padding: '32px 16px 120px', background: '#000', minHeight: '100vh', color: '#f2f2f2' }}>
      <h1 style={{ textAlign: 'center', fontSize: '1.2rem', margin: '0 0 8px' }}>Teste do Player Insano</h1>
      <p style={{ textAlign: 'center', fontSize: '0.85rem', margin: '0 0 24px', opacity: 0.7 }}>
        {completo ? (
          <a href="?" style={{ color: 'inherit' }}>
            Modo completo (todos os recursos). Voltar ao básico
          </a>
        ) : (
          <a href="?modo=completo" style={{ color: 'inherit' }}>
            Básico (como no funil). Testar todos os recursos
          </a>
        )}
      </p>

      <PlayerInsano
        key={completo ? 'completo' : filtro ? 'filtro' : 'basico'}
        video={VIDEO}
        opcoes={completo ? OPCOES_COMPLETAS : OPCOES}
        marcos={marcos}
        titulo="Vídeo de teste"
        // `?modo=filtro`: só passa quem chega com `?chave=ok`; os outros ficam sem vídeo e veem os botões na hora.
        filtro={filtro ? { chaveUrl: { nome: 'chave', valor: 'ok' } } : undefined}
        teste={
          completo
            ? {
                id: 'teste-aviso',
                variantes: [
                  { id: 'a' },
                  { id: 'b', opcoes: { textosAutoplay: { titulo: 'Seu vídeo começou!', acao: 'Toque para ouvir' } } },
                ],
              }
            : undefined
        }
      />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginTop: 32 }}>
        <a
          id="comprar"
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

      {completo && <div style={{ height: '150vh' }} aria-hidden="true" />}
    </main>
  );
}
