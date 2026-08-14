import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { rodape } from '@/content/desafio';

export function Rodape() {
  return (
    <footer className="footer">
      <div className="wrap">
        <Logo altura={30} />
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
