'use client';

import Image from 'next/image';
import { ComparadorAntesDepois } from '@/components/ui/ComparadorAntesDepois';
import { Rico } from '@/components/v2/Rico';
import { texto } from '../motor';
import type { PropsTela, TelaInfo as TelaInfoT } from '../tipos';
import { BotaoContinuar } from './comum';

/** Tela de conteúdo entre as perguntas: destaque opcional, texto e botão. */
export function TelaInfo({ tela, respostas, avancar }: PropsTela<TelaInfoT>) {
  const destaque = texto(tela.destaque, respostas);
  return (
    <section className="q-info">
      {destaque && <p className="q-info__destaque">{destaque}</p>}
      <h1 className={`q-titulo${destaque ? ' q-titulo--apoio' : ''}`}>
        <Rico texto={texto(tela.titulo, respostas)} />
      </h1>
      {tela.comparador && (
        <div className="q-info__comparador">
          <ComparadorAntesDepois {...tela.comparador} />
        </div>
      )}
      {tela.img && !tela.comparador && (
        <div className="q-info__img">
          <Image
            src={tela.img}
            alt=""
            fill
            sizes="(max-width: 560px) 100vw, 520px"
            style={tela.imgPosicao ? { objectPosition: tela.imgPosicao } : undefined}
          />
        </div>
      )}
      <div className="q-info__texto">
        {tela.linhas
          .map((l) => texto(l, respostas))
          .filter(Boolean)
          .map((l, i) => (
            <p key={i}>
              <Rico texto={l} />
            </p>
          ))}
      </div>
      <BotaoContinuar onClick={avancar}>{tela.botao ?? 'Continuar'}</BotaoContinuar>
    </section>
  );
}
