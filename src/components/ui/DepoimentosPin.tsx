'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { casos } from '@/content/desafio';
import { IMAGENS_PRONTAS } from '@/lib/flags';

/**
 * Depoimentos com scroll horizontal "pinned".
 *
 * A section fica alta o bastante pra o navegador rolar por N screens; dentro,
 * um wrapper sticky ocupa 100vh e enquanto a section está no viewport, o
 * trilho horizontal (com as fotos) é deslocado pela esquerda proporcional ao
 * progresso do scroll vertical dentro da section. Quando o usuário passa da
 * section, o sticky desprende e a página continua rolando normalmente.
 *
 * Só ativa em telas >= 900px e sem prefers-reduced-motion. Em mobile e leitor
 * assistivo, cai pro layout empilhado nativo — o próprio conteúdo continua
 * acessível (nenhuma prova social escondida atrás de JS).
 */
export function DepoimentosPin() {
  const secaoRef = useRef<HTMLDivElement>(null);
  const trilhoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const secao = secaoRef.current;
    const trilho = trilhoRef.current;
    if (!secao || !trilho) return;

    // Desliga em mobile / reduced-motion / viewport apertado — layout stack
    // nativo continua funcionando.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(max-width: 899px)').matches) return;

    secao.classList.add('dep-pin--ativo');

    let deslocamentoMax = 0;
    const medir = () => {
      // O quanto o trilho precisa ser puxado à esquerda pra mostrar tudo:
      // largura do conteúdo menos a largura visível da janela.
      deslocamentoMax = Math.max(0, trilho.scrollWidth - window.innerWidth);
      // A altura da section define quantos "vh de scroll" o pinning consome.
      // Uso 1× a largura extra do trilho + 1 viewport, com um piso pra dar
      // ~2 telas de scroll mesmo em telas grandes.
      const altura = Math.max(window.innerHeight * 1.6, window.innerHeight + deslocamentoMax);
      secao.style.height = `${altura}px`;
    };

    let pedido = 0;
    let visivel = false;
    const aplicar = () => {
      pedido = 0;
      const rect = secao.getBoundingClientRect();
      const alturaUtil = secao.offsetHeight - window.innerHeight;
      if (alturaUtil <= 0) return;
      const bruto = -rect.top / alturaUtil;
      const progresso = Math.max(0, Math.min(1, bruto));
      const x = deslocamentoMax * progresso;
      trilho.style.transform = `translate3d(${-x.toFixed(2)}px, 0, 0)`;
    };
    const agendar = () => {
      if (pedido || !visivel) return;
      pedido = requestAnimationFrame(aplicar);
    };

    medir();
    aplicar();

    // Pausa o listener de scroll fora do viewport — poupa main thread.
    const io = new IntersectionObserver(
      ([entrada]) => {
        visivel = entrada.isIntersecting;
        if (visivel) agendar();
      },
      { rootMargin: '200px 0px' },
    );
    io.observe(secao);

    window.addEventListener('scroll', agendar, { passive: true });
    window.addEventListener('resize', () => {
      medir();
      agendar();
    });
    return () => {
      window.removeEventListener('scroll', agendar);
      io.disconnect();
      if (pedido) cancelAnimationFrame(pedido);
      secao.classList.remove('dep-pin--ativo');
      secao.style.height = '';
      trilho.style.transform = '';
    };
  }, []);

  return (
    <div className="dep-pin" ref={secaoRef}>
      <div className="dep-pin__sticky">
        <div className="dep-pin__stage">
          <div className="dep-pin__trilho" ref={trilhoRef}>
            {casos.map((caso, i) => (
              <figure className="caso" key={caso.arquivo}>
                {IMAGENS_PRONTAS ? (
                  <Image
                    src={caso.arquivo}
                    alt={caso.alt}
                    width={caso.width}
                    height={caso.height}
                    sizes="(min-width: 1200px) 420px, 32vw"
                    loading="lazy"
                  />
                ) : (
                  <div
                    className="caso--vazio"
                    style={{ aspectRatio: `${caso.width} / ${caso.height}` }}
                  >
                    caso {String(i + 1).padStart(2, '0')}
                    <br />
                    aguardando foto
                  </div>
                )}
                <figcaption>
                  {caso.legenda} <span>antes → depois</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
