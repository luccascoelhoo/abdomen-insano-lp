'use client';

import { useId, useState } from 'react';
import type { FormEvent } from 'react';
import { idade } from '../motor';
import type { PropsTela, TelaNascimento as TelaNascimentoT } from '../tipos';
import { BotaoContinuar, Cabecalho } from './comum';

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
const ANO_ATUAL = new Date().getFullYear();
const dois = (n: number) => String(n).padStart(2, '0');

/**
 * Data de nascimento em três seletores nativos (no celular abrem a roleta do
 * sistema, o jeito mais rápido de escolher). Grava `nascimento` = 'AAAA-MM-DD'.
 */
export function TelaNascimento({ tela, respostas, responder }: PropsTela<TelaNascimentoT>) {
  const salvo = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(respostas.nascimento ?? ''));
  const [dia, setDia] = useState(salvo ? String(Number(salvo[3])) : '');
  const [mes, setMes] = useState(salvo ? String(Number(salvo[2])) : '');
  const [ano, setAno] = useState(salvo ? salvo[1] : '');
  const [erro, setErro] = useState<string | null>(null);
  const id = useId();

  const anos = Array.from({ length: 83 }, (_, i) => ANO_ATUAL - tela.idadeMinima - i);

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    if (!dia || !mes || !ano) return setErro('Escolha o dia, o mês e o ano.');
    const [d, m, a] = [Number(dia), Number(mes), Number(ano)];
    const data = new Date(Date.UTC(a, m - 1, d));
    if (data.getUTCDate() !== d || data.getUTCMonth() !== m - 1) return setErro('Essa data não existe. Confira o dia e o mês.');
    const iso = `${a}-${dois(m)}-${dois(d)}`;
    const anosDeIdade = idade(iso);
    if (anosDeIdade === null || anosDeIdade < tela.idadeMinima) {
      return setErro(`O desafio é para maiores de ${tela.idadeMinima} anos.`);
    }
    responder({ nascimento: iso });
  };

  const props = (set: (v: string) => void) => ({
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => {
      set(e.target.value);
      setErro(null);
    },
    'aria-invalid': !!erro,
    'aria-describedby': erro ? `${id}-erro` : undefined,
  });

  return (
    <form onSubmit={enviar} noValidate>
      <Cabecalho titulo={tela.titulo} sub={tela.sub} respostas={respostas} />
      <div className="q-data">
        <div className="q-data__campo">
          <label htmlFor={`${id}-dia`}>Dia</label>
          <select id={`${id}-dia`} className="q-select" value={dia} {...props(setDia)}>
            <option value="" disabled>
              Dia
            </option>
            {Array.from({ length: 31 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>
        <div className="q-data__campo q-data__campo--mes">
          <label htmlFor={`${id}-mes`}>Mês</label>
          <select id={`${id}-mes`} className="q-select" value={mes} {...props(setMes)}>
            <option value="" disabled>
              Mês
            </option>
            {MESES.map((nome, i) => (
              <option key={nome} value={i + 1}>
                {nome}
              </option>
            ))}
          </select>
        </div>
        <div className="q-data__campo">
          <label htmlFor={`${id}-ano`}>Ano</label>
          <select id={`${id}-ano`} className="q-select" value={ano} {...props(setAno)}>
            <option value="" disabled>
              Ano
            </option>
            {anos.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>
      {erro && (
        <p className="q-erro" id={`${id}-erro`} role="alert">
          {erro}
        </p>
      )}
      <BotaoContinuar type="submit" />
    </form>
  );
}
