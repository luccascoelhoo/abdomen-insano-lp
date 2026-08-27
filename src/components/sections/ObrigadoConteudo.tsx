'use client';

import { use } from 'react';
import { linksApp } from '@/lib/apps';
import { CheckCircle2, MessageCircle, Mail, Download, AlertCircle, Smartphone } from 'lucide-react';

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
              Sua vaga no Desafio Abdômen Insano está garantida. Siga os passos abaixo para acessar o aplicativo agora mesmo.
            </p>
          </div>
        </div>

        {/* Passos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Passo 1 - Email */}
          <div className="bg-[#1a1310] border border-gray-800 rounded-3xl p-8 relative overflow-hidden group hover:border-[#ff6b00]/50 transition-colors">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <Mail className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-[#ff6b00]/10 border border-[#ff6b00]/30 rounded-full flex items-center justify-center mb-6">
                <span className="text-[#ff6b00] font-black text-xl">1</span>
              </div>
              <h2 className="text-2xl font-bold mb-3">Abra seu email</h2>
              <p className="text-gray-400 leading-relaxed">
                Nós enviamos os seus dados de acesso (login e senha temporária) para o email que você usou na compra. {emailQuery ? <span className="text-white font-medium break-all"><br/>({emailQuery})</span> : ''}
              </p>
              <div className="mt-6 flex items-start gap-3 text-sm text-gray-400 bg-black/50 p-4 rounded-xl border border-gray-800/50">
                <AlertCircle className="w-5 h-5 text-[#ff6b00] flex-shrink-0" />
                <p>Caso não encontre na caixa de entrada, verifique a pasta de <b>Spam</b> ou <b>Promoções</b>.</p>
              </div>
            </div>
          </div>

          {/* Passo 2 - App */}
          <div className="bg-[#1a1310] border border-gray-800 rounded-3xl p-8 relative overflow-hidden group hover:border-[#ff6b00]/50 transition-colors flex flex-col">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <Smartphone className="w-32 h-32" />
            </div>
            <div className="relative z-10 flex-1 flex flex-col">
              <div>
                <div className="w-12 h-12 bg-[#ff6b00]/10 border border-[#ff6b00]/30 rounded-full flex items-center justify-center mb-6">
                  <span className="text-[#ff6b00] font-black text-xl">2</span>
                </div>
                <h2 className="text-2xl font-bold mb-3">Baixe o aplicativo</h2>
                <p className="text-gray-400 leading-relaxed mb-8">
                  Com seus dados de acesso em mãos, baixe o aplicativo oficial e faça o login para iniciar sua jornada.
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
        </div>

        {/* Passo 3 - WhatsApp (Destacado na largura toda) */}
        <div className="bg-gradient-to-r from-[#25D366]/10 to-transparent border border-[#25D366]/30 rounded-3xl p-8 sm:p-10 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <div className="inline-block bg-[#25D366]/20 text-[#25D366] text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
              Passo 3 (Opcional, mas recomendado)
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Comunidade VIP de Alunos</h2>
            <p className="text-gray-400 leading-relaxed">
              Junte-se ao nosso grupo exclusivo no WhatsApp. Tire dúvidas, acompanhe a evolução de outros atletas e não perca nenhum aviso importante do desafio.
            </p>
          </div>
          <a
            href="https://chat.whatsapp.com/seu-grupo-vip-aqui"
            target="_blank"
            rel="noopener noreferrer"
            className="group w-full sm:w-auto flex-shrink-0 flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#1fb355] text-white font-black uppercase tracking-wider px-8 py-5 rounded-2xl transition-all shadow-[0_0_20px_rgba(37,211,102,0.3)] hover:shadow-[0_0_40px_rgba(37,211,102,0.5)]"
          >
            <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span>Entrar no Grupo</span>
          </a>
        </div>

        <div className="text-center pt-8 border-t border-gray-800/50">
          <p className="text-gray-500 text-sm">
            Ficou com alguma dúvida ou não recebeu o email? <a href="#" className="text-[#ff6b00] hover:underline">Fale com nosso suporte</a>.
          </p>
        </div>

      </div>
    </section>
  );
}
