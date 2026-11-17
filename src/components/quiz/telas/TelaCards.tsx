'use client';

import Image from 'next/image';
import type { PropsTela, TelaCards as TelaCardsT } from '../tipos';
import { Cabecalho, useEscolhaUnica } from './comum';

/** Escolha única com foto: grade 2x2, avança ao tocar. */
export function TelaCards({ tela, respostas, responder }: PropsTela<TelaCardsT>) {
  const { atual, escolher } = useEscolhaUnica(tela.chave, respostas, responder);
  return (
    <section>
      <Cabecalho titulo={tela.titulo} sub={tela.sub} respostas={respostas} />
      <div className="q-cards">
        {tela.opcoes.map((o) => (
          <button
            key={o.v}
            type="button"
            className="q-card"
            aria-pressed={atual === o.v}
            onClick={() => escolher(o.v)}
          >
            <span className="q-card__foto">
              {o.img && <Image src={o.img} alt="" width={420} height={449} sizes="(max-width: 560px) 45vw, 250px" />}
              <span className="q-card__marca" aria-hidden="true" />
            </span>
            <span className="q-card__rotulo">{o.rotulo}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
