'use client';

import { use } from 'react';
import { linksApp } from '@/lib/apps';
import { CheckCircle2, Mail, Download, AlertCircle, Smartphone } from 'lucide-react';

type QueryParams = { email?: string; transaction_id?: string; tx?: string };

export function ObrigadoConteudo({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<QueryParams>;
}) {
  const query = use(searchParamsPromise);
  const emailQuery = query.email?.trim();

  const temApple = Boolean(linksApp.appStore);
  const temGoogle = Boolean(linksApp.playStore);

  return (
    <section className="min-h-[calc(100vh-80px)] bg-[#0c0b0a] text-white py-12 px-4 sm:px-6">
      <div className="w-full max-w-4xl mx-auto space-y-12">
        
        {/* Header - Sucesso */}
        <div className="text-center space-y-6">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-[#22c55e] blur-[40px] opacity-20 rounded-full"></div>
            <CheckCircle2 className="w-24 h-24 text-[#22c55e] relative z-10 animate-bounce mx-auto" />
          </div>
          
          <div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tight">
              Pagamento <span className="text-[#22c55e]">Aprovado!</span>
            </h1>
            <p className="text-gray-400 text-lg mt-4 max-w-2xl mx-auto leading-relaxed">
              Sua vaga no Desafio Abdômen Insano está garantida. Siga os passos abaixo para liberar seu acesso.
            </p>
          </div>
        </div>

        {/* Passos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Passo 1 - App */}
          <div className="bg-[#1a1310] border border-gray-800 rounded-3xl p-8 relative overflow-hidden group hover:border-[#ff6b00]/50 transition-colors flex flex-col">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <Smartphone className="w-32 h-32" />
            </div>
            <div className="relative z-10 flex-1 flex flex-col">
              <div>
                <div className="w-12 h-12 bg-[#ff6b00]/10 border border-[#ff6b00]/30 rounded-full flex items-center justify-center mb-6">
                  <span className="text-[#ff6b00] font-black text-xl">1</span>
                </div>
                <h2 className="text-2xl font-bold mb-3">Baixe o aplicativo</h2>
                <p className="text-gray-400 leading-relaxed mb-8">
                  Acesse a loja de aplicativos do seu celular agora mesmo e faça o download do nosso app oficial.
                </p>
              </div>
              
              <div className="mt-auto flex flex-col sm:flex-row gap-3">
                <a
                  href={temApple ? linksApp.appStore : '#'}
                  className="flex-1 flex items-center justify-center gap-2 bg-black hover:bg-gray-900 border border-gray-800 rounded-xl py-4 transition-all"
                >
                  <Download className="w-5 h-5 text-white" />
                  <span className="font-bold">App Store</span>
                </a>
                <a
                  href={temGoogle ? linksApp.playStore : '#'}
                  className="flex-1 flex items-center justify-center gap-2 bg-black hover:bg-gray-900 border border-gray-800 rounded-xl py-4 transition-all"
                >
                  <Download className="w-5 h-5 text-white" />
                  <span className="font-bold">Google Play</span>
                </a>
              </div>
            </div>
          </div>

          {/* Passo 2 - Cadastro no App */}
          <div className="bg-[#1a1310] border border-gray-800 rounded-3xl p-8 relative overflow-hidden group hover:border-[#ff6b00]/50 transition-colors">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <Mail className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-[#ff6b00]/10 border border-[#ff6b00]/30 rounded-full flex items-center justify-center mb-6">
                <span className="text-[#ff6b00] font-black text-xl">2</span>
              </div>
              <h2 className="text-2xl font-bold mb-3">Cadastre-se no App</h2>
              <p className="text-gray-400 leading-relaxed">
                Abra o aplicativo e clique em <b>Criar Conta</b>.
              </p>
              <div className="mt-6 flex items-start gap-3 text-sm text-gray-400 bg-black/50 p-4 rounded-xl border border-gray-800/50">
                <AlertCircle className="w-5 h-5 text-[#ff6b00] flex-shrink-0" />
                <p>
                  <b>Muito Importante:</b> Use exatamente o mesmo email que você utilizou na hora da compra para que o sistema libere o seu acesso automaticamente. 
                  {emailQuery ? <span className="text-white block mt-2 text-center bg-black/50 rounded py-1 px-2 border border-gray-800">{emailQuery}</span> : ''}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center pt-8 border-t border-gray-800/50">
          <p className="text-gray-500 text-sm">
            Enviamos um email de confirmação com esses links para você não perder. Ficou com dúvida? <a href="#" className="text-[#ff6b00] hover:underline">Fale com nosso suporte</a>.
          </p>
        </div>

      </div>
    </section>
  );
}
