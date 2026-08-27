'use client';

import { use, useEffect, useMemo, useState } from 'react';
import { linksApp } from '@/lib/apps';
import { CheckCircle2, Lock, MessageCircle, Smartphone, User, Mail, Phone, ArrowRight, ShieldCheck, Download } from 'lucide-react';

type QueryParams = { email?: string; transaction_id?: string; tx?: string };

type Etapa = 'checando' | 'nao_encontrada' | 'formulario' | 'enviando' | 'concluido' | 'erro';

type MensagensErro = Record<string, string>;

const MENSAGENS: MensagensErro = {
  backend_nao_configurado: 'O sistema de cadastro ainda não foi configurado no servidor. Fala com o suporte que a gente libera manualmente.',
  compra_nao_encontrada: 'Ainda não achamos sua compra com esse email. Se pagou agora, aguarde 2 minutos e tente de novo — o processamento do Cakto pode demorar um pouco.',
  ja_cadastrado: 'Já existe uma conta cadastrada com esse email. Se foi você, faz login direto no aplicativo com a senha que criou antes.',
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
      <section className="min-h-screen bg-[#0c0b0a] flex items-center justify-center text-white px-6">
        <div className="text-center max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff6b00] mx-auto mb-6"></div>
          <h1 className="text-3xl font-black mb-3">Só um segundo</h1>
          <p className="text-gray-400">Estamos checando sua compra no processador.</p>
        </div>
      </section>
    );
  }

  if (etapa === 'nao_encontrada') {
    return (
      <section className="min-h-screen bg-[#0c0b0a] flex items-center justify-center text-white px-6">
        <div className="text-center max-w-lg bg-[#1a1310] p-8 rounded-2xl border border-[#ff6b00]/30 shadow-[0_0_30px_rgba(255,107,0,0.1)]">
          <ShieldCheck className="w-16 h-16 text-[#ff6b00] mx-auto mb-6" />
          <h1 className="text-3xl font-black mb-4">Não achei sua compra ainda</h1>
          <p className="text-gray-300 mb-8 leading-relaxed">
            Se você pagou agora, o processador pode demorar até 2 minutos pra confirmar. Recarrega
            a página ou digita o email da compra abaixo pra tentar de novo.
          </p>
          <div className="flex flex-col gap-4">
            <input
              type="email"
              className="w-full bg-black border border-gray-800 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-[#ff6b00] transition-colors"
              placeholder="Digite o email da compra"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              onClick={() => window.location.assign(`?email=${encodeURIComponent(email)}`)}
              className="w-full bg-[#ff6b00] hover:bg-[#ff8533] text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(255,107,0,0.3)] hover:shadow-[0_0_30px_rgba(255,107,0,0.5)]"
            >
              Já paguei, quero cadastrar
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (etapa === 'erro') {
    return (
      <section className="min-h-screen bg-[#0c0b0a] flex items-center justify-center text-white px-6">
        <div className="text-center max-w-md bg-[#1a1310] p-8 rounded-2xl border border-red-500/30">
          <h1 className="text-3xl font-black mb-4 text-red-500">Ops, algo deu errado</h1>
          <p className="text-gray-300 mb-6">{erro}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-xl transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </section>
    );
  }

  if (etapa === 'concluido') {
    return <LiberadoAcesso email={email} nome={nome} />;
  }

  return (
    <section className="min-h-[calc(100vh-80px)] bg-[#0c0b0a] text-white flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
        
        {/* Lado Esquerdo - Boas Vindas */}
        <div className="space-y-8 max-w-xl mx-auto lg:mx-0">
          <div className="inline-flex items-center gap-2 bg-[#22c55e]/10 border border-[#22c55e]/30 px-4 py-2 rounded-full">
            <CheckCircle2 className="w-5 h-5 text-[#22c55e]" />
            <span className="text-[#22c55e] font-semibold text-sm uppercase tracking-wider">Pagamento Aprovado</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
            Crie sua conta para liberar o <span className="text-[#ff6b00]">acesso.</span>
          </h1>
          
          <p className="text-gray-400 text-lg leading-relaxed">
            Seu login funciona igual no site e dentro do aplicativo. Use o mesmo email da compra — é assim que a gente confirma seu acesso.
          </p>

          <div className="space-y-6 pt-4">
            {[
              { icon: User, title: 'Crie sua senha', desc: 'Configure seu acesso seguro ao lado.' },
              { icon: Smartphone, title: 'Baixe o app', desc: 'Disponível para iPhone e Android.' },
              { icon: ArrowRight, title: 'Comece o desafio', desc: 'Seu abdômen insano começa agora.' }
            ].map((passo, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#1a1310] border border-gray-800 rounded-xl flex items-center justify-center flex-shrink-0">
                  <passo.icon className="w-6 h-6 text-[#ff6b00]" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">{passo.title}</h3>
                  <p className="text-gray-500 text-sm">{passo.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lado Direito - Formulário */}
        <div className="w-full max-w-md mx-auto relative">
          {/* Efeito de brilho no fundo */}
          <div className="absolute inset-0 bg-[#ff6b00]/10 blur-[80px] rounded-full"></div>
          
          <form 
            onSubmit={submeter} 
            noValidate 
            className="relative bg-[#1a1310]/80 backdrop-blur-xl border border-gray-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6"
          >
            <div className="space-y-5">
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300">Email da compra</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={Boolean(emailInicial)}
                    className="w-full bg-black border border-gray-800 rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00] transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300">Seu nome completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    autoComplete="name"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                    className="w-full bg-black border border-gray-800 rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300">WhatsApp (opcional)</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="tel"
                    autoComplete="tel"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(11) 91234-5678"
                    className="w-full bg-black border border-gray-800 rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-300">Crie uma senha</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      minLength={8}
                      required
                      className="w-full bg-black border border-gray-800 rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-300">Confirme a senha</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={confirmar}
                      onChange={(e) => setConfirmar(e.target.value)}
                      required
                      className="w-full bg-black border border-gray-800 rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00] transition-all"
                    />
                  </div>
                </div>
              </div>

            </div>

            {erro && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-sm font-medium px-4 py-3 rounded-lg text-center" role="alert">
                {erro}
              </div>
            )}

            <button 
              type="submit" 
              disabled={!podeEnviar}
              className="w-full bg-[#ff6b00] hover:bg-[#ff8533] disabled:bg-gray-800 disabled:text-gray-500 disabled:shadow-none text-white font-black uppercase tracking-wider py-5 rounded-xl transition-all shadow-[0_0_20px_rgba(255,107,0,0.3)] hover:shadow-[0_0_35px_rgba(255,107,0,0.5)] mt-4"
            >
              {etapa === 'enviando' ? 'Criando sua conta...' : 'Liberar Meu Acesso'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function LiberadoAcesso({ email, nome }: { email: string; nome: string }) {
  const primeiroNome = nome.split(' ')[0] || 'atleta';
  const temApple = Boolean(linksApp.appStore);
  const temGoogle = Boolean(linksApp.playStore);

  return (
    <section className="min-h-screen bg-[#0c0b0a] text-white flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center space-y-10">
        
        {/* Ícone de Sucesso Gigante */}
        <div className="relative">
          <div className="absolute inset-0 bg-[#22c55e] blur-[40px] opacity-20 rounded-full"></div>
          <CheckCircle2 className="w-24 h-24 text-[#22c55e] relative z-10 animate-bounce" />
        </div>

        <div className="space-y-4">
          <p className="text-[#ff6b00] font-mono tracking-[0.2em] uppercase text-sm font-bold">Acesso Liberado</p>
          <h1 className="text-4xl sm:text-5xl font-black leading-tight">
            Tudo pronto, <br className="sm:hidden" />
            <span className="text-white">{primeiroNome}.</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto pt-2">
            Baixe o app agora e faça login usando <b className="text-white">{email}</b> e a senha que você acabou de criar.
          </p>
        </div>

        {/* Botões do App */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto pt-4">
          <a
            href={temApple ? linksApp.appStore : '#'}
            className="flex-1 flex items-center justify-center gap-3 bg-[#1a1310] hover:bg-[#2a201b] border border-gray-800 rounded-2xl py-4 transition-all"
          >
            <Download className="w-6 h-6 text-white" />
            <div className="text-left">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest leading-none mb-1">Baixar na</p>
              <p className="text-lg font-bold leading-none">App Store</p>
            </div>
          </a>

          <a
            href={temGoogle ? linksApp.playStore : '#'}
            className="flex-1 flex items-center justify-center gap-3 bg-[#1a1310] hover:bg-[#2a201b] border border-gray-800 rounded-2xl py-4 transition-all"
          >
            <Download className="w-6 h-6 text-white" />
            <div className="text-left">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest leading-none mb-1">Disponível no</p>
              <p className="text-lg font-bold leading-none">Google Play</p>
            </div>
          </a>
        </div>

        {/* Botão Grupo VIP */}
        <div className="w-full max-w-md mx-auto pt-8 border-t border-gray-800/50">
          <p className="text-gray-400 mb-4 text-sm font-medium">Passo Final Opcional, porém recomendado:</p>
          <a
            href="https://chat.whatsapp.com/seu-grupo-vip-aqui"
            target="_blank"
            rel="noopener noreferrer"
            className="group w-full flex items-center justify-center gap-4 bg-[#25D366] hover:bg-[#1fb355] text-white font-black uppercase tracking-wider py-5 rounded-2xl transition-all shadow-[0_0_20px_rgba(37,211,102,0.3)] hover:shadow-[0_0_40px_rgba(37,211,102,0.5)]"
          >
            <MessageCircle className="w-7 h-7 group-hover:scale-110 transition-transform" />
            <span>Entrar no Grupo VIP</span>
          </a>
          <p className="text-gray-500 text-xs mt-4">No grupo você tira dúvidas direto com o time e com a comunidade de atletas.</p>
        </div>

      </div>
    </section>
  );
}
