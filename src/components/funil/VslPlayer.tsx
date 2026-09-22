'use client';

import { useEffect, useRef } from 'react';
import type { Vsl } from '@/content/desafio';

type SmartPlayer = HTMLElement & {
  displayHiddenElements?: (segundos: number, seletores: string[], opcoes?: { persist?: boolean }) => void;
};

declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'vturb-smartplayer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

/** Seletor dos elementos que só aparecem no minuto do pitch. */
export const SELETOR_ESCONDIDO = '.esconder';

function revelarEscondidos() {
  document.querySelectorAll<HTMLElement>(SELETOR_ESCONDIDO).forEach((el) => {
    el.classList.remove('esconder');
  });
}

/**
 * VSL vertical da VTurb (ConverteAI).
 *
 * Aceita os dois embeds que o painel da VTurb gera:
 *  - atual (`.../v4/player.js`): elemento `<vturb-smartplayer id="vid-ID">`,
 *    e os botões são revelados pela API oficial `displayHiddenElements`;
 *  - antigo (`.../player.js`): `<div id="vid_ID">` + script com id `scr_ID`,
 *    e o delay é contado aqui mesmo pelo `timeupdate` do vídeo.
 * Nos dois casos quem já passou do pitch vê os botões de novo ao recarregar.
 *
 * Sem `playerId`, mostra o espaço reservado no mesmo formato 9:16 — a página
 * continua com o desenho certo enquanto o vídeo não chega.
 */
export function VslPlayer({ vsl }: { vsl: Vsl }) {
  const caixa = useRef<HTMLDivElement>(null);
  const configurado = Boolean(vsl.playerId && vsl.scriptUrl);
  const v4 = vsl.scriptUrl.includes('/v4/');

  useEffect(() => {
    const wrapper = caixa.current;
    if (!configurado || !wrapper) return;

    const chaveVisto = `ai_vsl_pitch_${vsl.playerId}`;
    const limpar: (() => void)[] = [];

    if (v4) {
      const player = wrapper.querySelector<SmartPlayer>('vturb-smartplayer');
      const aoFicarPronto = () => {
        if (vsl.delaySegundos > 0) {
          player?.displayHiddenElements?.(vsl.delaySegundos, [SELETOR_ESCONDIDO], { persist: true });
        }
      };
      player?.addEventListener('player:ready', aoFicarPronto);
      limpar.push(() => player?.removeEventListener('player:ready', aoFicarPronto));
    } else if (vsl.delaySegundos > 0) {
      try {
        if (localStorage.getItem(chaveVisto)) revelarEscondidos();
      } catch {
        /* storage bloqueado — conta o delay normalmente */
      }
      // `timeupdate` não borbulha, mas passa pela captura no ancestral.
      const aoAvancar = (evento: Event) => {
        const video = evento.target as HTMLVideoElement;
        if (video.currentTime < vsl.delaySegundos) return;
        revelarEscondidos();
        try {
          localStorage.setItem(chaveVisto, '1');
        } catch {}
        wrapper.removeEventListener('timeupdate', aoAvancar, true);
      };
      wrapper.addEventListener('timeupdate', aoAvancar, true);
      limpar.push(() => wrapper.removeEventListener('timeupdate', aoAvancar, true));
    }

    if (!document.querySelector(`script[src="${vsl.scriptUrl}"]`)) {
      const s = document.createElement('script');
      s.src = vsl.scriptUrl;
      s.async = true;
      if (v4) {
        document.head.appendChild(s);
      } else {
        // O player antigo procura o próprio <script> pelo id e monta ao lado dele.
        s.id = `scr_${vsl.playerId}`;
        wrapper.appendChild(s);
      }
    }

    return () => limpar.forEach((fn) => fn());
  }, [configurado, v4, vsl.playerId, vsl.scriptUrl, vsl.delaySegundos]);

  if (!configurado) {
    return (
      <div className="funil__vsl funil__vsl--vazio" role="img" aria-label="Vídeo em breve">
        <span className="funil__vsl-play" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l10.6-6.86a1 1 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14Z" />
          </svg>
        </span>
        <span className="funil__vsl-nota">VSL</span>
      </div>
    );
  }

  return (
    <div className="funil__vsl" ref={caixa}>
      {v4 ? (
        <vturb-smartplayer id={`vid-${vsl.playerId}`} style={{ display: 'block', margin: '0 auto', width: '100%' }} />
      ) : (
        <div id={`vid_${vsl.playerId}`} style={{ position: 'relative', width: '100%', padding: '177.78% 0 0' }} />
      )}
    </div>
  );
}
