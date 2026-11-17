'use client';

import { useEffect, useRef, useState } from 'react';
import { Rico } from '@/components/v2/Rico';
import { texto } from '../motor';
import type { PropsTela, Respostas, Texto } from '../tipos';

/** Título (32/900) + subtítulo (15/500) de toda tela de pergunta: o StepHeader do app, com a marcação **negrito** da copy. */
export function Cabecalho({ titulo, sub, respostas }: { titulo: Texto; sub?: Texto; respostas: Respostas }) {
  const s = texto(sub, respostas);
  return (
    <header className="q-cab">
      <h1 className="q-titulo">
        <Rico texto={texto(titulo, respostas)} />
      </h1>
      {s && (
        <p className="q-sub">
          <Rico texto={s} />
        </p>
      )}
    </header>
  );
}

/** Tempo que a opção tocada fica marcada antes de avançar (resposta visual ao dedo). */
const ESPERA_MS = 180;

/**
 * Escolha única que avança ao tocar: marca a opção na hora e só depois grava e
 * avança. Um segundo toque no meio do caminho é ignorado.
 */
export function useEscolhaUnica(chave: string, respostas: Respostas, responder: PropsTela['responder']) {
  const salvo = typeof respostas[chave] === 'string' ? (respostas[chave] as string) : null;
  const [escolhido, setEscolhido] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);

  // Se a tela sair antes do tempo (ex.: tocou em "voltar"), não grava nada.
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const escolher = (v: string) => {
    if (escolhido !== null) return;
    setEscolhido(v);
    timer.current = window.setTimeout(() => responder({ [chave]: v }), ESPERA_MS);
  };

  return { atual: escolhido ?? salvo, escolher };
}

export function IconeCheck({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
      <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type PropsBotao = {
  children?: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
  className?: string;
};

/**
 * Botão 3D do app (BotaoTresD em Componentes3D.kt): cápsula no degradê da
 * marca, camada mais escura 4 px abaixo e brilho em cima. Ao apertar, a face
 * afunda até a camada de baixo. Rótulo preto, como no app (passa o AA).
 * Sozinho, sem rodapé: para usar dentro de outros layouts.
 */
export function BotaoTresD({ children = 'Continuar', disabled, onClick, type = 'button', className }: PropsBotao) {
  return (
    <button type={type} className={className ? `q-botao ${className}` : 'q-botao'} disabled={disabled} onClick={onClick}>
      <span className="q-botao__base" aria-hidden="true" />
      <span className="q-botao__face">{children}</span>
    </button>
  );
}

/** Botão principal das telas que avançam por botão: o BotaoTresD fixo no rodapé. */
export function BotaoContinuar(props: PropsBotao) {
  return (
    <div className="q-rodape">
      <BotaoTresD {...props} />
    </div>
  );
}
