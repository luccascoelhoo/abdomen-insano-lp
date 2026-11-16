'use client';

import Image from 'next/image';
import { Rico } from '@/components/v2/Rico';
import { texto } from '../motor';
import type { PropsTela, TelaAbertura as TelaAberturaT } from '../tipos';
import { useEscolhaUnica } from './comum';

/** Primeira tela: headline, foto e a primeira pergunta já com as opções. */
export function TelaAbertura({ tela, respostas, responder }: PropsTela<TelaAberturaT>) {
  const { atual, escolher } = useEscolhaUnica(tela.chave, respostas, responder);
  const sub = texto(tela.sub, respostas);
  return (
    <section className="q-abertura">
      <h1 className="q-titulo q-titulo--grande">
        <Rico texto={texto(tela.titulo, respostas)} />
      </h1>
      {sub && (
        <p className="q-sub">
          <Rico texto={sub} />
        </p>
      )}
      <div className="q-abertura__img">
        <Image src={tela.img} alt="" fill priority sizes="(max-width: 560px) 100vw, 520px" />
      </div>
      <p className="q-pergunta" id="q-abertura-pergunta">
        {tela.pergunta}
      </p>
      <div className="q-grade2" role="group" aria-labelledby="q-abertura-pergunta">
        {tela.opcoes.map((o) => (
          <button
            key={o.v}
            type="button"
            className="q-opcao q-opcao--centro"
            aria-pressed={atual === o.v}
            onClick={() => escolher(o.v)}
          >
            {o.rotulo}
          </button>
        ))}
      </div>
    </section>
  );
}
