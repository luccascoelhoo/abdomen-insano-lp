'use client';

import { useEffect, useRef } from 'react';
import { MaskTitle } from '@/components/ui/MaskTitle';
import { Reveal } from '@/components/ui/Reveal';
import { Semanas } from '@/components/ui/Semanas';
import { metodo, pilares } from '@/content/desafio';

export function Metodo() {
  const pilaresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = pilaresRef.current;
    if (!container) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const items = Array.from(container.querySelectorAll<HTMLElement>('.pilar'));

    /**
     * Marca "pilar--ativo" no bloco que está atualmente no centro do viewport.
     * rootMargin -38%/-38% dá uma "zona quente" de ~24% da altura da tela —
     * quem entra nela ganha destaque, os outros perdem.
     */
    const io = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          const el = entrada.target as HTMLElement;
          el.classList.toggle('pilar--ativo', entrada.isIntersecting);
        }
      },
      { rootMargin: '-38% 0px -38% 0px', threshold: 0 },
    );

    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section className="sec sec--alt">
      <div className="wrap">
        <div className="metodo__grid">
          {/* Coluna esquerda gruda enquanto os pilares passam ao lado. */}
          <div className="metodo__fixo">
            <Reveal as="p" className="rotulo">
              {metodo.eyebrow}
            </Reveal>
            <MaskTitle className="d2" linhas={['Como funciona', 'essa parada?']} />
            <Reveal as="p" className="lead" delay={180}>
              {metodo.lead}
            </Reveal>

            {/* Indicador de progresso do bloco ativo */}
            <div className="metodo__indice" aria-hidden="true">
              {pilares.map((p, i) => (
                <span key={p.numero} className="metodo__indice-item">
                  <b>{String(i + 1).padStart(2, '0')}</b>
                  <span>{p.titulo}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="pilares" ref={pilaresRef}>
            {pilares.map((pilar, i) => (
              <Reveal
                className="pilar"
                key={pilar.numero}
                delay={i * 80}
                style={{ ['--pilar-i' as string]: i }}
              >
                <span className="pilar__n" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="d3">{pilar.titulo}</h3>
                  {pilar.paragrafos.map((texto) => (
                    <p key={texto}>{texto}</p>
                  ))}
                  {pilar.aviso && (
                    <p className="pilar__nota">
                      <b>{pilar.aviso.rotulo}</b>
                      {pilar.aviso.texto}
                    </p>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Semanas />
      </div>
    </section>
  );
}
