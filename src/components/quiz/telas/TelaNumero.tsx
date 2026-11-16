'use client';

import { useId, useState } from 'react';
import type { FormEvent } from 'react';
import type { PropsTela, TelaNumero as TelaNumeroT } from '../tipos';
import { BotaoContinuar, Cabecalho } from './comum';

/** "82,5" / "82.5" → 82.5; "175" → 175. Inteiro em cm, uma casa em kg. */
function ler(t: string, decimal: boolean): number | null {
  if (!t) return null;
  const n = Number(t.replace(',', '.'));
  if (!Number.isFinite(n)) return null;
  return decimal ? Math.round(n * 10) / 10 : Math.round(n);
}

function formatar(n: number, decimal: boolean): string {
  return decimal ? String(Math.round(n * 10) / 10).replace('.', ',') : String(Math.round(n));
}

/** Número com unidade (altura em cm, peso em kg), digitado ou nos botões − e +. */
export function TelaNumero({ tela, respostas, responder }: PropsTela<TelaNumeroT>) {
  const decimal = tela.unidade === 'kg';
  const salvo = respostas[tela.chave];
  const base = typeof salvo === 'number' ? salvo : tela.inicial;
  const [valor, setValor] = useState(() => formatar(base, decimal));
  const [erro, setErro] = useState<string | null>(null);
  const id = useId();
  const atual = ler(valor, decimal);

  const mudar = (t: string) => {
    const limpo = decimal ? t.replace(/[^\d.,]/g, '') : t.replace(/\D/g, '');
    // kg: até 3 dígitos e uma casa decimal (vírgula ou ponto); cm: até 3 dígitos.
    if (decimal ? !/^\d{0,3}([.,]\d?)?$/.test(limpo) : limpo.length > 3) return;
    setValor(limpo);
    setErro(null);
  };

  const passo = (d: number) => {
    const n = Math.min(tela.max, Math.max(tela.min, (atual ?? base) + d));
    setValor(formatar(n, decimal));
    setErro(null);
  };

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    if (atual === null) return setErro('Digite um número.');
    if (atual < tela.min || atual > tela.max) {
      return setErro(`Digite um valor entre ${tela.min} e ${tela.max} ${tela.unidade}.`);
    }
    const extra = tela.validar?.(atual, respostas);
    if (extra) return setErro(extra);
    responder({ [tela.chave]: atual });
  };

  return (
    <form onSubmit={enviar} noValidate>
      <Cabecalho titulo={tela.titulo} sub={tela.sub} respostas={respostas} />
      <div className="q-numero">
        <button
          type="button"
          className="q-numero__passo"
          aria-label={`Diminuir 1 ${tela.unidade}`}
          disabled={atual !== null && atual <= tela.min}
          onClick={() => passo(-1)}
        >
          −
        </button>
        <div className={`q-numero__campo${erro ? ' q-numero__campo--erro' : ''}`}>
          <label className="q-sr" htmlFor={id}>
            Valor em {tela.unidade === 'cm' ? 'centímetros' : 'quilos'}
          </label>
          <input
            id={id}
            className="q-numero__input"
            type="text"
            inputMode={decimal ? 'decimal' : 'numeric'}
            autoComplete="off"
            enterKeyHint="next"
            value={valor}
            onChange={(e) => mudar(e.target.value)}
            onFocus={(e) => e.target.select()}
            aria-invalid={!!erro}
            aria-describedby={erro ? `${id}-erro` : undefined}
            size={decimal ? 5 : 3}
          />
          <span className="q-numero__unidade" aria-hidden="true">
            {tela.unidade}
          </span>
        </div>
        <button
          type="button"
          className="q-numero__passo"
          aria-label={`Aumentar 1 ${tela.unidade}`}
          disabled={atual !== null && atual >= tela.max}
          onClick={() => passo(1)}
        >
          +
        </button>
      </div>
      {erro && (
        <p className="q-erro q-erro--centro" id={`${id}-erro`} role="alert">
          {erro}
        </p>
      )}
      <BotaoContinuar type="submit" />
    </form>
  );
}
