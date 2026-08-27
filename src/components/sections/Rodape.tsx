import Image from 'next/image';
import Link from 'next/link';
import { rodape } from '@/content/desafio';
import { linksApp } from '@/lib/apps';
import { Download } from 'lucide-react';

export function Rodape() {
  const temApple = Boolean(linksApp.appStore);
  const temGoogle = Boolean(linksApp.playStore);

  return (
    <footer className="footer relative pb-16">
      <div className="wrap">
        <div className="footer__brand">
          <Image
            src="/img/logo-branca.svg"
            alt="Ícone Abdômen Insano"
            width={88}
            height={88}
            className="footer__brand-icone"
          />
          <span className="footer__brand-nome">
            Abdômen <b>Insano</b>
          </span>
        </div>
        <nav className="footer__nav">
          {rodape.navegacao.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.rotulo}
            </Link>
          ))}
        </nav>

        {/* Botões do App */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto mt-10 mb-12">
          <a
            href={temApple ? linksApp.appStore : '#'}
            className="flex-1 flex items-center justify-center gap-3 bg-black/50 hover:bg-[#ff6b00]/10 border border-gray-800 hover:border-[#ff6b00]/50 rounded-2xl py-4 transition-all"
          >
            <Download className="w-6 h-6 text-white" />
            <div className="text-left">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest leading-none mb-1">Baixar na</p>
              <p className="text-base font-bold leading-none text-white">App Store</p>
            </div>
          </a>

          <a
            href={temGoogle ? linksApp.playStore : '#'}
            className="flex-1 flex items-center justify-center gap-3 bg-black/50 hover:bg-[#ff6b00]/10 border border-gray-800 hover:border-[#ff6b00]/50 rounded-2xl py-4 transition-all"
          >
            <Download className="w-6 h-6 text-white" />
            <div className="text-left">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest leading-none mb-1">Disponível no</p>
              <p className="text-base font-bold leading-none text-white">Google Play</p>
            </div>
          </a>
        </div>

        <p className="legal">
          <b>Responsáveis técnicos:</b>
          <br />
          {rodape.responsaveis}
          <br />
          <br />
          {rodape.empresa}
          <br />
          {rodape.aviso}
        </p>
      </div>

      {/* Assinatura em contorno, cortada pela borda de baixo da página. */}
      <div className="footer__marca" aria-hidden="true">
        Abdômen Insano
      </div>
    </footer>
  );
}
