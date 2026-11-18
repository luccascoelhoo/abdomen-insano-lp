'use client';

import { useId, useState } from 'react';
import type { FormEvent } from 'react';
// Mesma regra da API (`validar.ts` não tem imports, roda no navegador):
// o que passa aqui não pode ser recusado lá, senão o contato some calado.
import { emailValido } from '@/app/api/quiz/validar';
import { Rico } from '@/components/v2/Rico';
import { rodape } from '@/content/desafio';
import { rastrear } from '@/lib/pixel';
import { lerUtm } from '@/lib/utm';
import { enviarQuiz } from '../envio';
import { montarPayload, texto } from '../motor';
import type { PropsTela, TelaEmail as TelaEmailT } from '../tipos';
import { BotaoContinuar } from './comum';

const PRIVACIDADE = rodape.navegacao.find((l) => /privacidade/i.test(l.rotulo))?.href;

/** UTMs guardadas, só as que têm valor (o payload pede Record<string, string>). */
function utmDoNavegador(): Record<string, string> {
  const utm: Record<string, string> = {};
  for (const [k, v] of Object.entries(lerUtm())) if (typeof v === 'string' && v) utm[k] = v;
  return utm;
}

/** E-mail + aceite. Dispara o Lead, manda o cadastro e segue sem esperar a rede. */
export function TelaEmail({ tela, respostas, responder }: PropsTela<TelaEmailT>) {
  const [email, setEmail] = useState(typeof respostas.email === 'string' ? respostas.email : '');
  const [aceite, setAceite] = useState(respostas.aceiteEmail === true);
  const [erros, setErros] = useState<{ email?: string }>({});
  const [enviando, setEnviando] = useState(false);
  const id = useId();
  const sub = texto(tela.sub, respostas);

  const enviar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (enviando) return;
    const m = email.trim();
    const novos: typeof erros = {};
    if (!emailValido(m.toLowerCase())) novos.email = 'Digite um e-mail válido.';
    setErros(novos);
    if (novos.email) {
      document.getElementById(`${id}-email`)?.focus();
      return;
    }

    setEnviando(true);
    const site = String(new FormData(e.currentTarget).get('site') ?? '');
    // O nome já veio da tela anterior (respostas.nome).
    const valores = { email: m, aceiteEmail: aceite };
    rastrear('Lead');
    // Sem `await`: a pessoa segue para o diagnóstico enquanto o cadastro viaja.
    enviarQuiz(montarPayload({ ...respostas, ...valores }, utmDoNavegador(), site)).catch(() => {});
    responder(valores);
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
        <label htmlFor={`${id}-email`}>Seu melhor e-mail</label>
        <input
          id={`${id}-email`}
          className="q-input"
          type="email"
          name="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="go"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!erros.email}
          aria-describedby={erros.email ? `${id}-email-erro` : `${id}-aviso`}
        />
        {erros.email && (
          <p className="q-erro" id={`${id}-email-erro`}>
            {erros.email}
          </p>
        )}
      </div>

      <p className="q-aviso" id={`${id}-aviso`}>
        {tela.aviso}
      </p>

      <label className="q-check">
        <input type="checkbox" checked={aceite} onChange={(e) => setAceite(e.target.checked)} />
        <span className="q-check__caixa" aria-hidden="true" />
        <span>Quero receber dicas e lembretes do desafio por e-mail</span>
      </label>

      {/* Isca anti-robô: gente não vê nem alcança; robô preenche. */}
      <div className="q-isca" aria-hidden="true">
        <label htmlFor={`${id}-site`}>Site</label>
        <input id={`${id}-site`} type="text" name="site" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <BotaoContinuar type="submit" disabled={enviando}>
        Ver o meu plano
      </BotaoContinuar>

      {PRIVACIDADE && (
        <p className="q-privacidade">
          Saiba como usamos os seus dados na{' '}
          <a href={PRIVACIDADE} target="_blank" rel="noopener noreferrer">
            Política de Privacidade
          </a>
          .
        </p>
      )}
    </form>
  );
}
