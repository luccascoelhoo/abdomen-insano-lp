'use client';

import { useState } from 'react';
import { idade } from '../motor';
import type { PropsTela, Respostas, TelaNascimento as TelaNascimentoT } from '../tipos';
import { Aviso } from './Aviso';
import { BotaoContinuar, Cabecalho } from './comum';
import { ISO, RodaDeDatas, diasNoMes, hojeSP, isoDe, partes, porExtenso } from './RodaDeDatas';

/** Idade do meio de cada faixa da primeira tela: a roda já abre perto. */
const IDADE_DA_FAIXA: Record<string, number> = { '18-24': 21, '25-34': 30, '35-44': 40, '45+': 50 };

function dataInicial(r: Respostas, anoAtual: number, anoMin: number, anoMax: number): string {
  const salvo = typeof r.nascimento === 'string' && ISO.test(r.nascimento) ? r.nascimento : null;
  if (salvo) {
    const [a, m, d] = partes(salvo);
    const ano = Math.min(anoMax, Math.max(anoMin, a));
    return isoDe(ano, m, Math.min(d, diasNoMes(ano, m)));
  }
  const alvo = IDADE_DA_FAIXA[String(r.faixaIdade)];
  return alvo ? isoDe(anoAtual - alvo, 6, 15) : '2000-06-15';
}

/**
 * Data de nascimento na roda do app. Como no app, a data que a roda abre não
 * vale sozinha: ou a pessoa gira, ou toca em "Toque para confirmar". Grava
 * `nascimento` = 'AAAA-MM-DD'.
 */
export function TelaNascimento({ tela, respostas, responder }: PropsTela<TelaNascimentoT>) {
  const [hoje] = useState(hojeSP);
  const anoAtual = Number(hoje.slice(0, 4));
  const anoMin = anoAtual - 100;
  const anoMax = anoAtual - tela.idadeMinima;
  const [valor, setValor] = useState(() => dataInicial(respostas, anoAtual, anoMin, anoMax));
  const [confirmado, setConfirmado] = useState(() => typeof respostas.nascimento === 'string');

  const anos = idade(valor);
  const menor = confirmado && (anos === null || anos < tela.idadeMinima);

  return (
    <div className="qc-tela">
      <Cabecalho titulo={tela.titulo} sub={tela.sub} respostas={respostas} />
      <RodaDeDatas
        valor={valor}
        aoMudar={(v) => {
          setValor(v);
          setConfirmado(true);
        }}
        anoMin={anoMin}
        anoMax={anoMax}
        rotulo="Data de nascimento"
      />
      {!confirmado && (
        <button type="button" className="qc-confirmar" onClick={() => setConfirmado(true)}>
          Toque para confirmar: {porExtenso(valor)}
        </button>
      )}
      <div aria-live="polite">
        {menor && <Aviso bloqueante texto={`O desafio é para maiores de ${tela.idadeMinima} anos.`} />}
      </div>
      <BotaoContinuar disabled={!confirmado || menor} onClick={() => responder({ nascimento: valor })} />
    </div>
  );
}
