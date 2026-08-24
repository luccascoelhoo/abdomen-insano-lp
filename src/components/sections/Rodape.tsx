import Image from 'next/image';
import Link from 'next/link';
import { rodape } from '@/content/desafio';

export function Rodape() {
  return (
    <footer className="footer">
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
