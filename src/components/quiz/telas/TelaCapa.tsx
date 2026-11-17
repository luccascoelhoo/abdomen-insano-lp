'use client';

import { Rico } from '@/components/v2/Rico';
import { textosCapa } from '@/content/quiz';
import { nivelDaCapa } from '../motor';
import type { NivelCapa, PropsTela, TelaCapa as TelaCapaT } from '../tipos';
import { BotaoContinuar } from './comum';

const ORDEM: NivelCapa[] = ['fina', 'media', 'grossa', 'muito-grossa'];

/** "A sua capa de gordura é X": nível calculado pelo motor, num medidor de 4 degraus. */
export function TelaCapa({ respostas, avancar }: PropsTela<TelaCapaT>) {
  const nivel = nivelDaCapa(respostas);
  const atual = ORDEM.indexOf(nivel);
  const dados = textosCapa.niveis[nivel];
  return (
    <section className="q-capa">
      <p className="q-capa__chamada">{textosCapa.titulo}</p>
      <h1 className="q-capa__nivel">{dados.rotulo}</h1>

      <ol className="q-medidor" aria-label={`Nível ${atual + 1} de ${ORDEM.length}`}>
        {ORDEM.map((n, i) => (
          <li
            key={n}
            className={`q-medidor__passo${i === atual ? ' is-atual' : ''}${i < atual ? ' is-antes' : ''}`}
            aria-current={i === atual ? 'step' : undefined}
          >
            {i === atual && <span className="q-medidor__voce">Você</span>}
            <span className="q-medidor__barra" style={{ height: `${14 + i * 10}px` }} aria-hidden="true" />
            <span className="q-medidor__rotulo">{textosCapa.niveis[n].rotulo}</span>
          </li>
        ))}
      </ol>

      <p className="q-capa__texto">
        <Rico texto={dados.texto} />
      </p>
      <p className="q-nota">{textosCapa.nota}</p>
      <BotaoContinuar onClick={avancar} />
    </section>
  );
}
