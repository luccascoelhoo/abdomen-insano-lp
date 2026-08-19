'use client';

import { useEffect, useRef } from 'react';

const ITENS = [
  '42 dias',
  'abdômen insano',
  '+5.500 alunos',
  'dentro do app',
  '1 real por dia',
];

// Renderiza várias cópias do grupo. O wrap-around só fica invisível se, no
// momento em que o trilho reseta -largura → 0, ainda houver pelo menos um
// viewport de conteúdo à direita da posição visível. Duas cópias não bastam
// em telas médias/grandes.
const COPIAS = 6;

/**
 * Faixa preta com os argumentos correndo na horizontal.
 *
 * O trilho anda continuamente da direita para a esquerda com um leve balanço
 * em Y (aspecto de anel rolando). A rolagem da página acelera o movimento e
 * inclina o trilho no sentido do dedo. Sem rolagem, o balanço mantém o "vivo".
 */
export function Pista() {
  const trilho = useRef<HTMLDivElement>(null);
  const grupoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = trilho.current;
    const grupo = grupoRef.current;
    if (!el || !grupo) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let largura = grupo.offsetWidth;
    let deslocamento = 0;
    let velocidadeRolagem = 0;
    let ultimoY = window.scrollY;
    let quadro = 0;
    let visivel = false;
    const inicioTempo = performance.now();

    const remedir = () => {
      largura = grupo.offsetWidth;
    };

    const aoRolar = () => {
      const y = window.scrollY;
      // Fling do trackpad pode entregar delta de 300+px num evento só. Sem
      // clamp o trilho pula centenas de pixels num frame, deixando o
      // wrap-around visível e o movimento espasmódico.
      const delta = y - ultimoY;
      velocidadeRolagem = Math.max(-60, Math.min(60, delta));
      ultimoY = y;
    };

    const passo = (agora: number) => {
      deslocamento -= 2.2 + velocidadeRolagem * 0.35;
      velocidadeRolagem *= 0.86;

      // Modulo mantém o deslocamento em (-largura, 0] mesmo se um único
      // frame passar de -largura em várias vezes. Sem isso, `+= largura`
      // solto deixa o trilho preso em áreas fora da cópia por vários frames.
      if (largura > 0) {
        const norm = ((deslocamento % largura) + largura) % largura;
        deslocamento = norm === 0 ? 0 : norm - largura;
      }

      const t = (agora - inicioTempo) / 1000;
      const balanco = Math.sin(t * 1.2) * 4;
      const rot = Math.sin(t * 0.9) * 3;
      const skew = Math.max(-6, Math.min(6, velocidadeRolagem * 0.35));

      el.style.transform =
        `translate3d(${deslocamento}px, ${balanco}px, 0) ` +
        `rotateX(${rot}deg) skewX(${skew}deg)`;

      quadro = visivel ? requestAnimationFrame(passo) : 0;
    };

    const io = new IntersectionObserver(
      ([entrada]) => {
        visivel = entrada.isIntersecting;
        if (visivel && !quadro) quadro = requestAnimationFrame(passo);
      },
      { rootMargin: '200px 0px' },
    );
    io.observe(el);

    window.addEventListener('scroll', aoRolar, { passive: true });
    window.addEventListener('resize', remedir);
    return () => {
      window.removeEventListener('scroll', aoRolar);
      window.removeEventListener('resize', remedir);
      io.disconnect();
      if (quadro) cancelAnimationFrame(quadro);
    };
  }, []);

  const conteudo = ITENS.map((item, i) => (
    <span key={item} className="pista__grupo">
      <span className={i % 2 ? 'pista__item pista__item--vazado' : 'pista__item'}>
        {item}
      </span>
      <span className="pista__ponto" />
    </span>
  ));

  return (
    <div className="pista" aria-hidden="true">
      <div className="pista__trilho" ref={trilho}>
        {Array.from({ length: COPIAS }, (_, k) => (
          <div className="pista__grupo" key={k} ref={k === 0 ? grupoRef : null}>
            {conteudo}
          </div>
        ))}
      </div>
    </div>
  );
}
