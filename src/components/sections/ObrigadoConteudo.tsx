'use client';

import { use } from 'react';
import { CheckCircle2, Mail, AlertCircle } from 'lucide-react';

type QueryParams = { email?: string; transaction_id?: string; tx?: string };

export function ObrigadoConteudo({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<QueryParams>;
}) {
  const query = use(searchParamsPromise);
  const emailQuery = query.email?.trim();

  return (
    <section className="min-h-[calc(100vh-80px)] bg-[#0c0b0a] text-white flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-2xl mx-auto space-y-10">
        
        {/* Header - Sucesso */}
        <div className="text-center space-y-6">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-[#22c55e] blur-[40px] opacity-20 rounded-full"></div>
            <CheckCircle2 className="w-24 h-24 text-[#22c55e] relative z-10 animate-bounce mx-auto" />
          </div>
          
          <div>
            <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-tight">
              Pagamento <span className="text-[#22c55e]">Aprovado!</span>
            </h1>
            <p className="text-gray-400 text-lg mt-4 leading-relaxed">
              Sua vaga no Desafio Abdômen Insano está garantida. Siga a instrução abaixo para liberar seu acesso.
            </p>
          </div>
        </div>

        {/* Passo Único - Email */}
        <div className="bg-[#1a1310] border border-gray-800 rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Mail className="w-48 h-48" />
          </div>
          <div className="relative z-10 text-center">
            <div className="w-16 h-16 bg-[#ff6b00]/10 border border-[#ff6b00]/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-[#ff6b00]" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Abra seu email</h2>
            <p className="text-gray-300 text-lg leading-relaxed max-w-lg mx-auto">
              Acabamos de enviar um email de confirmação para você com o <b className="text-white">link de download do aplicativo</b> e todas as instruções de acesso.
            </p>
            {emailQuery && (
              <div className="mt-4 inline-block bg-black/50 border border-gray-800 text-[#ff6b00] px-4 py-2 rounded-xl text-lg font-medium">
                {emailQuery}
              </div>
            )}
            
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 text-sm text-gray-400 bg-black/50 p-5 rounded-2xl border border-gray-800/50">
              <AlertCircle className="w-6 h-6 text-[#ff6b00] flex-shrink-0" />
              <p className="text-left">
                <b>Atenção:</b> Ao abrir o app pela primeira vez, certifique-se de <b>Criar Conta</b> usando exatamente o mesmo email da compra.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center pt-6">
          <p className="text-gray-500 text-sm">
            Não encontrou na caixa de entrada? Verifique o <b>Spam</b> ou <b>Promoções</b>. Se precisar de ajuda, <a href="#" className="text-[#ff6b00] hover:underline">fale com nosso suporte</a>.
          </p>
        </div>

      </div>
    </section>
  );
}
