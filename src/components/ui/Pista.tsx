'use client';

import { useEffect, useRef } from 'react';

const ITENS = [
  '42 dias',
  'abdômen insano',
  '+5.500 alunos',
  'dentro do app',
  '1 real por dia',
];

/**
 * Faixa preta com os argumentos correndo na horizontal.
 *
 * A base é um trilho que anda continuamente da direita para a esquerda com
 * um leve balanço em Y (aspecto de anel rolando). A rolagem da página acelera
 * o movimento e inclina o trilho no sentido do dedo — como se a mão empurrasse
 * o cilindro. Sem rolagem, o balanço mantém o "vivo" da faixa.
 */
export function Pista() {
  const trilho = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = trilho.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const largura = el.scrollWidth / 2; // conteúdo duplicado
    let deslocamento = 0;
    let velocidadeRolagem = 0;
    let ultimoY = window.scrollY;
    let quadro = 0;
    const inicioTempo = performance.now();

    const aoRolar = () => {
      const y = window.scrollY;
      velocidadeRolagem = y - ultimoY;
      ultimoY = y;
    };

    const passo = (agora: number) => {
      // Movimento base contínuo + empurrão da rolagem.
      deslocamento -= 2.2 + velocidadeRolagem * 0.55;
      velocidadeRolagem *= 0.9;
      if (deslocamento <= -largura) deslocamento += largura;
      if (deslocamento > 0) deslocamento -= largura;

      // Balanço em Y — pequena senoide que dá "vivo" mesmo parado.
      const t = (agora - inicioTempo) / 1000;
      const balanco = Math.sin(t * 1.2) * 4;

      // Rotação Y sutil sempre presente (aspecto de anel girando em 3D).
      const rot = Math.sin(t * 0.9) * 3;

      // Skew responde à velocidade do scroll — cilindro inclina no sentido
      // do dedo quando a página se move.
      const skew = Math.max(-8, Math.min(8, velocidadeRolagem * 0.45));

      el.style.transform =
        `translate3d(${deslocamento}px, ${balanco}px, 0) ` +
        `rotateX(${rot}deg) skewX(${skew}deg)`;

      quadro = requestAnimationFrame(passo);
    };

    window.addEventListener('scroll', aoRolar, { passive: true });
    quadro = requestAnimationFrame(passo);
    return () => {
      window.removeEventListener('scroll', aoRolar);
      cancelAnimationFrame(quadro);
    };
  }, []);

  const grupo = (chave: string) => (
    <div className="pista__grupo" key={chave}>
      {ITENS.map((item, i) => (
        <span key={`${chave}-${item}`} className="pista__grupo">
          <span className={i % 2 ? 'pista__item pista__item--vazado' : 'pista__item'}>
            {item}
          </span>
          <span className="pista__ponto" />
        </span>
      ))}
    </div>
  );

  return (
    <div className="pista" aria-hidden="true">
      <div className="pista__trilho" ref={trilho}>
        {grupo('a')}
        {grupo('b')}
      </div>
    </div>
  );
}
