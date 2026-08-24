'use client';

import { useEffect, useState } from 'react';

type Props = {
  /** Duração total em segundos. Default: 9m59s. */
  duracao?: number;
  /** Chave usada pra persistir o instante-alvo no localStorage. */
  chave?: string;
  className?: string;
};

/**
 * Contagem regressiva "por sessão".
 *
 * A primeira visita registra `Date.now() + duracao*1000` no localStorage
 * usando a `chave`. Recarregar a página ou abrir de novo continua a mesma
 * contagem — só bate 00:00 depois que o tempo real acabar. Assim evita
 * o padrão marketing de resetar o timer a cada refresh (que corrói a
 * confiança quando o usuário percebe).
 *
 * Ao zerar, trava em 00:00 (não reinicia sozinho).
 */
export function Countdown({
  duracao = 9 * 60 + 59,
  chave = 'oferta-countdown-alvo',
  className,
}: Props) {
  const [restante, setRestante] = useState<number | null>(null);

  useEffect(() => {
    let alvo: number;
    try {
      const salvo = localStorage.getItem(chave);
      const salvoNum = salvo ? Number(salvo) : 0;
      if (salvoNum && salvoNum > Date.now()) {
        alvo = salvoNum;
      } else {
        alvo = Date.now() + duracao * 1000;
        localStorage.setItem(chave, String(alvo));
      }
    } catch {
      alvo = Date.now() + duracao * 1000;
    }

    const tick = () => {
      const diff = Math.max(0, Math.floor((alvo - Date.now()) / 1000));
      setRestante(diff);
      return diff;
    };
    tick();
    const id = setInterval(() => {
      if (tick() <= 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [duracao, chave]);

  // Enquanto não hidrata, reserva o espaço com "--:--" pra não pular o layout.
  const label =
    restante == null
      ? '--:--'
      : `${String(Math.floor(restante / 60)).padStart(2, '0')}:${String(restante % 60).padStart(2, '0')}`;

  return (
    <span className={className} aria-label={`Tempo restante: ${label}`}>
      {label}
    </span>
  );
}
