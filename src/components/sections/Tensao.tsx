'use client';

import { useEffect, useRef } from 'react';
import { MaskTitle } from '@/components/ui/MaskTitle';
import { Reveal } from '@/components/ui/Reveal';
import { tensao } from '@/content/desafio';

/**
 * Bloco de tensão — nomeia o problema real antes de apresentar a solução.
 *
 * Vem entre Hero e Método. Fundo escuro pra quebrar o ritmo bege da página.
 * Cada bloco entra em sequência conforme o scroll ativa a section.
 */
export function Tensao() {
  const secaoRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = secaoRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('tensao--ativa');
      return;
    }

    const io = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (entrada.isIntersecting) {
            el.classList.add('tensao--ativa');
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="tensao" ref={secaoRef}>
      <div className="wrap">
        <Reveal as="p" className="rotulo tensao__rotulo">
          {tensao.eyebrow}
        </Reveal>

        <MaskTitle
          as="h2"
          className="d2 tensao__titulo"
          linhas={tensao.tituloLinhas}
          classesLinha={['linha', 'linha--2']}
        />

        <div className="tensao__blocos">
          {tensao.blocos.map((bloco, i) => (
            <div
              key={bloco.chave}
              className="tensao__bloco"
              style={{ transitionDelay: `${i * 180}ms` }}
            >
              {'lista' in bloco && (
                <>
                  <ul className="tensao__lista">
                    {bloco.lista.map((item, j) => (
                      <li
                        key={item}
                        style={{
                          transitionDelay: `${i * 180 + 260 + j * 110}ms`,
                        }}
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="tensao__remate">{bloco.remate}</p>
                </>
              )}

              {'titulo' in bloco && (
                <>
                  <h3 className="tensao__subtitulo">{bloco.titulo}</h3>
                  {bloco.paragrafos.map((p) => (
                    <p key={p} className="tensao__paragrafo">
                      {p}
                    </p>
                  ))}
                </>
              )}

              <p className="tensao__destaque">{bloco.destaque}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
