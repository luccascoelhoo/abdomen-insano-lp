'use client';

import { use, useEffect, useMemo, useState } from 'react';
import { linksApp } from '@/lib/apps';

type QueryParams = { email?: string; transaction_id?: string; tx?: string };

type Etapa = 'checando' | 'nao_encontrada' | 'formulario' | 'enviando' | 'concluido' | 'erro';

type MensagensErro = Record<string, string>;

const MENSAGENS: MensagensErro = {
  backend_nao_configurado:
    'O sistema de cadastro ainda não foi configurado no servidor. Fala com o suporte que a gente libera manualmente.',
  compra_nao_encontrada:
    'Ainda não achamos sua compra com esse email. Se pagou agora, aguarde 2 minutos e tente de novo — o processamento do Cakto pode demorar um pouco.',
  ja_cadastrado:
    'Já existe uma conta cadastrada com esse email. Se foi você, faz login direto no aplicativo com a senha que criou antes.',
  email_invalido: 'Confere o formato do email.',
  senha_curta: 'A senha precisa ter pelo menos 8 caracteres.',
  nome_invalido: 'Diz seu nome completo.',
  erro_cadastro: 'Não consegui concluir agora. Tenta de novo em alguns segundos.',
  erro_consulta: 'Tive um problema ao consultar sua compra. Tenta de novo.',
  json_invalido: 'Dados inválidos. Recarrega a página.',
};

function traduzir(motivo?: string): string {
  if (!motivo) return 'Algo deu errado. Tenta de novo.';
  return MENSAGENS[motivo] ?? MENSAGENS.erro_cadastro;
}

export function CadastroFluxo({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<QueryParams>;
}) {
  const query = use(searchParamsPromise);
  const emailInicial = query.email?.trim() ?? '';

  const [etapa, setEtapa] = useState<Etapa>('checando');
  const [email, setEmail] = useState(emailInicial);
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [erro, setErro] = useState<string>('');

  // Passo 1 — Bypass: vai direto para o formulário para testes.
  useEffect(() => {
    setEtapa('formulario');
  }, [emailInicial]);

  const podeEnviar = useMemo(() => {
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    return (
      emailValido &&
      nome.trim().length >= 2 &&
      senha.length >= 8 &&
      senha === confirmar &&
      etapa !== 'enviando'
    );
  }, [email, nome, senha, confirmar, etapa]);

  async function submeter(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    if (!podeEnviar) {
      if (senha !== confirmar) setErro('As senhas não batem.');
      else setErro('Confere os campos antes de enviar.');
      return;
    }
    setEtapa('enviando');
    // Bypass: simula uma requisição com sucesso para testes.
    setTimeout(() => {
      setEtapa('concluido');
    }, 800);
  }

  if (etapa === 'checando') {
    return (
      <section className="obrigado obrigado--intro">
        <div className="wrap">
          <p className="rotulo">Confirmando pagamento…</p>
          <h1 className="d1 obrigado__titulo">Só um segundo</h1>
          <p className="lead">Estamos checando sua compra no processador.</p>
          <div className="obrigado__spinner" aria-hidden />
        </div>
      </section>
    );
  }

  if (etapa === 'nao_encontrada') {
    return (
      <section className="obrigado obrigado--intro">
        <div className="wrap">
          <p className="rotulo">Quase lá</p>
          <h1 className="d1 obrigado__titulo">Não achei sua compra ainda</h1>
          <p className="lead">
            Se você pagou agora, o processador pode demorar até 2 minutos pra confirmar. Recarrega
            a página ou digita o email da compra abaixo pra tentar de novo.
          </p>
          <button
            className="cta"
            type="button"
            onClick={() => {
              setEtapa('formulario');
              setEmail('');
            }}
          >
            Já paguei, quero cadastrar
          </button>
        </div>
      </section>
    );
  }

  if (etapa === 'concluido') {
    return <LiberadoAcesso email={email} nome={nome} />;
  }

  return (
    <section className="obrigado">
      <div className="wrap obrigado__grid">
        <div>
          <p className="rotulo">Etapa 2 de 2</p>
          <h1 className="d1 obrigado__titulo">
            Pagamento aprovado.
            <br />
            <span className="obrigado__ok">Crie sua conta.</span>
          </h1>
          <p className="lead">
            Seu login funciona igual no site e dentro do aplicativo. Use o mesmo email da compra —
            é assim que a gente confirma seu acesso.
          </p>
          <ul className="obrigado__passos" aria-hidden>
            <li>
              <b>01</b>
              <span>Crie sua senha</span>
            </li>
            <li>
              <b>02</b>
              <span>Baixe o app</span>
            </li>
            <li>
              <b>03</b>
              <span>Comece o desafio</span>
            </li>
          </ul>
        </div>

        <form className="cadastro" onSubmit={submeter} noValidate>
          <label className="campo">
            <span>Email da compra</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={Boolean(emailInicial)}
            />
          </label>

          <label className="campo">
            <span>Seu nome completo</span>
            <input
              type="text"
              autoComplete="name"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </label>

          <label className="campo">
            <span>WhatsApp (opcional)</span>
            <input
              type="tel"
              autoComplete="tel"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="(11) 91234-5678"
            />
          </label>

          <div className="campo-linha">
            <label className="campo">
              <span>Crie uma senha</span>
              <input
                type="password"
                autoComplete="new-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                minLength={8}
                required
              />
              <em>mínimo 8 caracteres</em>
            </label>

            <label className="campo">
              <span>Confirme a senha</span>
              <input
                type="password"
                autoComplete="new-password"
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                required
              />
            </label>
          </div>

          {erro && (
            <p className="cadastro__erro" role="alert">
              {erro}
            </p>
          )}

          <button className="cta cta--cheio" type="submit" disabled={!podeEnviar}>
            {etapa === 'enviando' ? 'Criando sua conta…' : 'Criar conta e liberar acesso'}
          </button>

          <p className="cadastro__nota">
            Ao criar sua conta você concorda com os{' '}
            <a href="/termos">termos de uso</a> e a{' '}
            <a href="/privacidade">política de privacidade</a>.
          </p>
        </form>
      </div>
    </section>
  );
}

function LiberadoAcesso({ email, nome }: { email: string; nome: string }) {
  const primeiroNome = nome.split(' ')[0] || 'atleta';
  const temApple = Boolean(linksApp.appStore);
  const temGoogle = Boolean(linksApp.playStore);

  return (
    <section className="obrigado obrigado--fim">
      <div className="wrap">
        <p className="rotulo rotulo--claro">Acesso liberado</p>
        <h1 className="d1 obrigado__titulo obrigado__titulo--claro">
          Bem-vindo ao desafio,
          <br />
          <span className="obrigado__ok">{primeiroNome}.</span>
        </h1>
        <p className="lead obrigado__lead-claro">
          Baixe o app agora, faça login com{' '}
          <b className="obrigado__email">{email}</b> e a senha que você acabou de criar. Seu acesso
          já está liberado.
        </p>

        <div className="apps">
          {temApple ? (
            <a
              className="app app--apple"
              href={linksApp.appStore}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="app__eyebrow">Baixe na</span>
              <span className="app__nome">App Store</span>
            </a>
          ) : (
            <div className="app app--breve" aria-disabled>
              <span className="app__eyebrow">Em breve na</span>
              <span className="app__nome">App Store</span>
              <span className="app__aviso">te avisamos no email da compra</span>
            </div>
          )}

          {temGoogle ? (
            <a
              className="app app--google"
              href={linksApp.playStore}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="app__eyebrow">Disponível no</span>
              <span className="app__nome">Google Play</span>
            </a>
          ) : (
            <div className="app app--breve" aria-disabled>
              <span className="app__eyebrow">Em breve no</span>
              <span className="app__nome">Google Play</span>
              <span className="app__aviso">te avisamos no email da compra</span>
            </div>
          )}
        </div>

        <div className="obrigado__proximos">
          <h2 className="d3">Próximos 42 dias</h2>
          <ol>
            <li>Baixe o app na loja acima.</li>
            <li>
              Abra e faça login com <b>{email}</b>.
            </li>
            <li>Comece o Dia 01. O app te lembra todo dia no horário que você escolher.</li>
          </ol>
        </div>
      </div>
    </section>
  );
}
