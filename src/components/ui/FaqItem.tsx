'use client';

import { useEffect, useId, useRef, useState } from 'react';

type Props = {
  numero: string;
  pergunta: string;
  resposta: string;
  aberto?: boolean;
};

/**
 * Item do FAQ com collapse suave.
 *
 * Substitui o `<details>` nativo (sem transição). Usa altura calculada via
 * ref pra permitir `max-height` animado sem hardcodar valor. Mantém o padrão
 * de acessibilidade: `button` + `aria-expanded` + região com `id`.
 */
export function FaqItem({ numero, pergunta, resposta, aberto: iniciaAberto = false }: Props) {
  const [aberto, setAberto] = useState(iniciaAberto);
  const corpoRef = useRef<HTMLDivElement>(null);
  const [altura, setAltura] = useState(0);
  const id = useId();

  useEffect(() => {
    if (!corpoRef.current) return;
    // Mede a altura real da resposta pra transição chegar exatamente lá.
    const medir = () => setAltura(corpoRef.current?.scrollHeight ?? 0);
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(corpoRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="faq-item" data-open={aberto ? 'true' : 'false'}>
      <button
        className="faq-item__botao"
        aria-expanded={aberto}
        aria-controls={id}
        onClick={() => setAberto((v) => !v)}
      >
        <i aria-hidden="true">{numero}</i>
        <span>{pergunta}</span>
        <u aria-hidden="true">{aberto ? '−' : '+'}</u>
      </button>
      <div
        id={id}
        className="faq-item__corpo"
        role="region"
        style={{ maxHeight: aberto ? `${altura + 32}px` : 0 }}
      >
        <div ref={corpoRef} className="faq-item__conteudo">
          <p>{resposta}</p>
        </div>
      </div>
    </div>
  );
}
