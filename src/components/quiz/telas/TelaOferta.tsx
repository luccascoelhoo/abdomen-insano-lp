'use client';

import { useEffect, useMemo, type ReactNode } from 'react';
import { ProvedorOferta } from '../oferta/contexto';
import type { PropsTela } from '../tipos';

/**
 * Tela 'oferta': a casca da página final. Os blocos (cartão premium com o
 * preço, "como funciona", as 3 engrenagens, garantia, FAQ) chegam prontos do
 * servidor em `oferta` (`BlocoOfertaQuiz`); aqui só se abre o contexto com as
 * respostas, que o cartão premium usa pra personalizar o texto, e o atalho de
 * corrigir o e-mail. No fim, "Refazer o quiz" (quando o quiz oferece recomecar).
 */
export function TelaOferta({ respostas, oferta, irPara, recomecar }: PropsTela & { oferta: ReactNode }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const dados = useMemo(() => ({ respostas, irPara }), [respostas, irPara]);

  return (
    <div className="qr-oferta">
      <ProvedorOferta value={dados}>{oferta}</ProvedorOferta>
      {recomecar && (
        <div className="v2 qo-refazer-faixa">
          <button type="button" className="qo-refazer" onClick={recomecar}>
            Refazer o quiz
          </button>
        </div>
      )}
    </div>
  );
}
