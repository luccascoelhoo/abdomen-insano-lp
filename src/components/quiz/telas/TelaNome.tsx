'use client';

import { useId, useState } from 'react';
import type { FormEvent } from 'react';
import { Rico } from '@/components/v2/Rico';
import { texto } from '../motor';
import type { PropsTela, TelaNome as TelaNomeT } from '../tipos';
import { BotaoContinuar } from './comum';

/** Só o nome, numa tela própria: um campo por tela dá menos atrito. */
export function TelaNome({ tela, respostas, responder }: PropsTela<TelaNomeT>) {
  const [nome, setNome] = useState(typeof respostas.nome === 'string' ? respostas.nome : '');
  const [erro, setErro] = useState('');
  const id = useId();
  const sub = texto(tela.sub, respostas);

  const enviar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const n = nome.trim();
    if (n.length < 2) return void setErro('Digite o seu nome.');
    if (n.length > 80) return void setErro('Use até 80 letras.');
    responder({ nome: n });
  };

  return (
    <form className="q-email" onSubmit={enviar} noValidate>
      <header className="q-cab">
        <h1 className="q-titulo">
          <Rico texto={texto(tela.titulo, respostas)} />
        </h1>
        {sub && (
          <p className="q-sub">
            <Rico texto={sub} />
          </p>
        )}
      </header>

      <div className="q-campo">
        <label htmlFor={`${id}-nome`}>Seu primeiro nome</label>
        <input
          id={`${id}-nome`}
          className="q-input"
          type="text"
          name="nome"
          maxLength={80}
          autoComplete="given-name"
          autoCapitalize="words"
          enterKeyHint="go"
          autoFocus
          value={nome}
          onChange={(e) => {
            setNome(e.target.value);
            if (erro) setErro('');
          }}
          aria-invalid={!!erro}
          aria-describedby={erro ? `${id}-nome-erro` : undefined}
        />
        {erro && (
          <p className="q-erro" id={`${id}-nome-erro`}>
            {erro}
          </p>
        )}
      </div>

      <BotaoContinuar type="submit">Continuar</BotaoContinuar>
    </form>
  );
}
