'use client';

import type { PropsTela, TelaLista as TelaListaT } from '../tipos';
import { Cabecalho, useEscolhaUnica } from './comum';

/** Escolha única em lista (cartões da PremiumOptionsList do app): avança ao tocar. */
export function TelaLista({ tela, respostas, responder }: PropsTela<TelaListaT>) {
  const { atual, escolher } = useEscolhaUnica(tela.chave, respostas, responder);
  return (
    <section>
      <Cabecalho titulo={tela.titulo} sub={tela.sub} respostas={respostas} />
      <div className="q-lista">
        {tela.opcoes.map((o) => (
          <button
            key={o.v}
            type="button"
            className="q-opcao"
            aria-pressed={atual === o.v}
            onClick={() => escolher(o.v)}
          >
            <span className="q-opcao__texto">{o.rotulo}</span>
            <span className="q-opcao__radio" aria-hidden="true" />
          </button>
        ))}
      </div>
    </section>
  );
}
