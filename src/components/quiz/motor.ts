'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Respostas, Tela } from './tipos';

export * from './calculos';

/* ------------------------------------------------------------------ estado */

/**
 * O progresso salvo guarda o índice da tela: ao mudar a ordem ou a quantidade
 * de telas em `content/quiz.ts`, suba a versão para ninguém voltar na tela errada.
 */
export const VERSAO_QUIZ = 5;
const CHAVE_LOCAL = `ai_quiz_v${VERSAO_QUIZ}`;
/** Toques mais próximos que isso viram um só (toque duplo pulava telas). */
const TRAVA_MS = 400;

/**
 * Retomar de onde parou vale para quem saiu NO MEIO das perguntas. Quem já viu
 * o resultado ou a oferta e volta, volta do começo (senão o quiz abre direto na
 * oferta e a pessoa não consegue refazer). Progresso parado há mais que isto
 * também é descartado. `?novo=1` na URL começa do zero (útil para testar).
 */
const VALIDADE_MS = 6 * 3_600_000;
const VALIDADE_RESULTADO_MS = 30 * 60_000;

interface Salvo {
  /** Última atividade (ms), para saber se o progresso ainda vale. */
  t?: number;
  i: number;
  r: Respostas;
}

/**
 * Estado do quiz: índice da tela + respostas, salvos no navegador para quem
 * sair continuar de onde parou. Telas com `quando` falso são puladas.
 */
export function useQuiz(telas: Tela[]) {
  const [i, setI] = useState(0);
  const [r, setR] = useState<Respostas>({});
  const [pronto, setPronto] = useState(false);
  // Respostas mais recentes fora do ciclo de render: `responder` grava e
  // avança na mesma chamada sem efeito colateral dentro do updater do React.
  const rRef = useRef<Respostas>({});
  const ultimaTroca = useRef(0);
  const podeTrocar = () => {
    const agora = Date.now();
    if (agora - ultimaTroca.current < TRAVA_MS) return false;
    ultimaTroca.current = agora;
    return true;
  };

  // Lê o progresso salvo só no navegador, depois da hidratação (o servidor não
  // tem localStorage; ler no useState inicial quebraria a hidratação).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(CHAVE_LOCAL) ?? 'null') as Salvo | null;
      const recomecarDoZero = new URLSearchParams(window.location.search).has('novo');
      const parado = Date.now() - (s?.t ?? 0);
      const primeiraDoResultado = telas.findIndex((t) => t.k === 'diagnostico');
      const jaViuResultado = !!s && primeiraDoResultado >= 0 && s.i >= primeiraDoResultado;
      const valido = !!s && !!s.t && parado <= VALIDADE_MS && !(jaViuResultado && parado > VALIDADE_RESULTADO_MS);
      if (s && valido && !recomecarDoZero && typeof s.i === 'number' && s.r) {
        setI(Math.min(s.i, telas.length - 1));
        rRef.current = s.r;
        setR(s.r);
      }
    } catch {}
    setPronto(true);
  }, [telas]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!pronto) return;
    try {
      localStorage.setItem(CHAVE_LOCAL, JSON.stringify({ i, r, t: Date.now() } satisfies Salvo));
    } catch {}
  }, [i, r, pronto]);

  const visivel = useCallback((idx: number, resp: Respostas) => {
    const t = telas[idx];
    return !!t && (!t.quando || t.quando(resp));
  }, [telas]);

  const proxima = useCallback((de: number, resp: Respostas, passo: 1 | -1) => {
    let n = de + passo;
    while (n >= 0 && n < telas.length && !visivel(n, resp)) n += passo;
    return Math.max(0, Math.min(telas.length - 1, n));
  }, [telas.length, visivel]);


  const responder = useCallback((valores: Respostas, op?: { avancar?: boolean }) => {
    const avanca = op?.avancar !== false;
    if (avanca && !podeTrocar()) return;
    const novo = { ...rRef.current, ...valores };
    rRef.current = novo;
    setR(novo);
    if (avanca) setI((idx) => proxima(idx, novo, 1));
  }, [proxima]);

  const avancar = useCallback(() => {
    if (podeTrocar()) setI((idx) => proxima(idx, rRef.current, 1));
  }, [proxima]);
  const voltar = useCallback(() => {
    if (podeTrocar()) setI((idx) => proxima(idx, rRef.current, -1));
  }, [proxima]);
  const irPara = useCallback((k: Tela['k']) => {
    const idx = telas.findIndex((t) => t.k === k);
    if (idx >= 0) setI(idx);
  }, [telas]);
  const recomecar = useCallback(() => {
    rRef.current = {};
    setR({});
    setI(0);
  }, []);

  /** Progresso 0–1 dentro das telas visíveis. */
  const progresso = useMemo(() => {
    const vis = telas.map((_, idx) => idx).filter((idx) => visivel(idx, r));
    const pos = vis.indexOf(i);
    return vis.length > 1 ? Math.max(0, pos) / (vis.length - 1) : 0;
  }, [telas, visivel, r, i]);

  return { i, tela: telas[i], respostas: r, responder, avancar, voltar, irPara, recomecar, progresso, pronto };
}
