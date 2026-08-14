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
 * A velocidade responde à rolagem: parado ela desliza devagar, e quando a
 * pessoa rola a faixa acelera e inverte o sentido junto com o dedo. É o
 * movimento que dá "corpo" à página — sem ele o preto entre duas seções é só
 * uma tarja.
 */
export function Pista() {
  const trilho = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = trilho.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const largura = el.scrollWidth / 2; // o conteúdo está duplicado
    let deslocamento = 0;
    let velocidadeRolagem = 0;
    let ultimoY = window.scrollY;
    let quadro = 0;

    const aoRolar = () => {
      const y = window.scrollY;
      velocidadeRolagem = y - ultimoY;
      ultimoY = y;
    };

    const passo = () => {
      // Base constante + empurrão da rolagem, que desaparece sozinho.
      deslocamento -= 0.45 + velocidadeRolagem * 0.28;
      velocidadeRolagem *= 0.9;
      if (deslocamento <= -largura) deslocamento += largura;
      if (deslocamento > 0) deslocamento -= largura;
      el.style.transform = `translate3d(${deslocamento}px,0,0)`;
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
