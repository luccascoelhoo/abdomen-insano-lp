'use client';

import { useState } from 'react';
import type { PropsTela, TelaMulti as TelaMultiT } from '../tipos';
import { BotaoContinuar, Cabecalho, IconeCheck } from './comum';

/** Múltipla escolha: a opção `exclusiva` ("nada") desmarca as outras e vice-versa. */
export function TelaMulti({ tela, respostas, responder }: PropsTela<TelaMultiT>) {
  const salvo = respostas[tela.chave];
  const [marcadas, setMarcadas] = useState<string[]>(Array.isArray(salvo) ? salvo : []);
  const exclusivas = new Set(tela.opcoes.filter((o) => o.exclusiva).map((o) => o.v));

  const alternar = (v: string) =>
    setMarcadas((atual) => {
      if (atual.includes(v)) return atual.filter((x) => x !== v);
      if (exclusivas.has(v)) return [v];
      return [...atual.filter((x) => !exclusivas.has(x)), v];
    });

  return (
    <section>
      <Cabecalho titulo={tela.titulo} sub={tela.sub} respostas={respostas} />
      <div className="q-lista">
        {tela.opcoes.map((o) => (
          <button
            key={o.v}
            type="button"
            className="q-opcao"
            aria-pressed={marcadas.includes(o.v)}
            onClick={() => alternar(o.v)}
          >
            <span className="q-opcao__texto">{o.rotulo}</span>
            <span className="q-opcao__caixa" aria-hidden="true">
              <IconeCheck />
            </span>
          </button>
        ))}
      </div>
      <BotaoContinuar disabled={marcadas.length === 0} onClick={() => responder({ [tela.chave]: marcadas })} />
    </section>
  );
}
