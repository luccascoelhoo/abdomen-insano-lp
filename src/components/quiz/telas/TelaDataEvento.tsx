'use client';

import { useState } from 'react';
import { Rico } from '@/components/v2/Rico';
import { diasAte } from '../motor';
import type { PropsTela, TelaDataEvento as TelaDataEventoT } from '../tipos';
import { Aviso } from './Aviso';
import { BotaoContinuar, Cabecalho } from './comum';
import { ISO, RodaDeDatas, hojeSP, somarDias } from './RodaDeDatas';

/** "Faltam **9 semanas**" (ou dias, abaixo de duas semanas). */
function quantoFalta(dias: number): string {
  if (dias === 1) return 'Falta **1 dia**';
  if (dias < 14) return `Faltam **${dias} dias**`;
  return `Faltam **${Math.floor(dias / 7)} semanas**`;
}

/**
 * Data futura (o evento) na roda do app: de amanhã até hoje + `maxDias`.
 * Grava `tela.chave` = 'AAAA-MM-DD'.
 */
export function TelaDataEvento({ tela, respostas, responder }: PropsTela<TelaDataEventoT>) {
  const [hoje] = useState(hojeSP);
  const minimo = somarDias(hoje, 1);
  const maximo = somarDias(hoje, tela.maxDias);
  const [valor, setValor] = useState(() => {
    const salvo = respostas[tela.chave];
    if (typeof salvo === 'string' && ISO.test(salvo) && salvo >= minimo && salvo <= maximo) return salvo;
    return somarDias(hoje, Math.min(60, tela.maxDias));
  });

  const dias = diasAte(valor);
  const valido = dias !== null && dias >= 1 && dias <= tela.maxDias;

  return (
    <div className="qc-tela">
      <Cabecalho titulo={tela.titulo} sub={tela.sub} respostas={respostas} />
      <RodaDeDatas
        valor={valor}
        aoMudar={setValor}
        anoMin={Number(minimo.slice(0, 4))}
        anoMax={Number(maximo.slice(0, 4))}
        minimo={minimo}
        maximo={maximo}
        rotulo="Data"
      />
      {valido && (
        <p className="qc-ajuda">
          <Rico texto={quantoFalta(dias)} />
        </p>
      )}
      <div aria-live="polite">
        {valido && dias < 7 && (
          <Aviso texto="É em poucos dias: dá pra chegar mais seco, e o resultado maior vem depois." />
        )}
      </div>
      <BotaoContinuar disabled={!valido} onClick={() => responder({ [tela.chave]: valor })} />
    </div>
  );
}
