'use client';

import { useActionState } from 'react';
import { entrar } from './acoes';

export function FormSenha() {
  const [erro, acao, enviando] = useActionState(entrar, '');
  return (
    <form action={acao} className="pn-login__form">
      <label htmlFor="senha">Senha de acesso</label>
      <input id="senha" name="senha" type="password" inputMode="numeric" autoComplete="current-password" autoFocus required />
      {erro ? <p className="pn-login__erro" role="alert">{erro}</p> : null}
      <button type="submit" disabled={enviando}>{enviando ? 'Entrando…' : 'Entrar'}</button>
    </form>
  );
}
