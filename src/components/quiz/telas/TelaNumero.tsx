'use client';

import { useState } from 'react';
import { Rico } from '@/components/v2/Rico';
import { texto } from '../motor';
import type { PropsTela, Respostas, TelaNumero as TelaNumeroT } from '../tipos';
import { Aviso } from './Aviso';
import { BotaoContinuar, Cabecalho } from './comum';
import { Regua } from './Regua';

const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const kg = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1).replace('.', ','));

/**
 * Número com unidade (altura em cm, peso e meta em kg) na régua do app, passo 1.
 * A meta começa no peso atual (como no app), a não ser que já tenha resposta.
 */
export function TelaNumero({ tela, respostas, responder }: PropsTela<TelaNumeroT>) {
  const salvo = num(respostas[tela.chave]);
  const pesoAtual = num(respostas.peso);
  const ehMeta = tela.chave === 'pesoDesejado';
  const [valor, setValor] = useState(() => {
    const base = salvo ?? (ehMeta && pesoAtual !== null ? pesoAtual : tela.inicial);
    return Math.min(tela.max, Math.max(tela.min, Math.round(base)));
  });

  // A trava do conteúdo (IMC da meta < 18,5), ao vivo, no card de aviso do app.
  const aviso = tela.validar?.(valor, respostas) ?? null;

  let diferenca: string | null = null;
  if (ehMeta && pesoAtual !== null) {
    // Mesma tolerância do app (`objetivoPelaMeta`): menos de meio quilo é manter.
    const d = Math.round((valor - pesoAtual) * 10) / 10;
    diferenca =
      Math.abs(d) < 0.5
        ? 'Você quer **manter o peso**'
        : d < 0
          ? `Você quer perder **${kg(-d)} kg**`
          : `Você quer ganhar **${kg(d)} kg**`;
  }

  const continuar = () => {
    if (aviso) return;
    const valores: Respostas = { [tela.chave]: valor };
    // Como no app: meta "colada" no peso anda junto quando o peso é corrigido,
    // para ninguém virar "perder" ou "ganhar" sem ter mexido na meta.
    if (tela.chave === 'peso' && pesoAtual !== null && respostas.pesoDesejado === pesoAtual) {
      valores.pesoDesejado = valor;
    }
    responder(valores);
  };

  return (
    <div className="qc-tela">
      <Cabecalho titulo={tela.titulo} sub={tela.sub} respostas={respostas} />
      <Regua
        valor={valor}
        min={tela.min}
        max={tela.max}
        unidade={tela.unidade}
        rotulo={texto(tela.titulo, respostas)}
        falar={(v) => `${v} ${tela.unidade === 'cm' ? 'centímetros' : v === 1 ? 'quilo' : 'quilos'}`}
        aoMudar={setValor}
      />
      {diferenca && (
        <p className="qc-ajuda">
          <Rico texto={diferenca} />
        </p>
      )}
      <div aria-live="polite">{aviso && <Aviso texto={aviso} />}</div>
      <BotaoContinuar disabled={!!aviso} onClick={continuar} />
    </div>
  );
}
