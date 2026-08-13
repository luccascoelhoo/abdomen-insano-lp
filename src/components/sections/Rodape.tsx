import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { rodape } from '@/content/desafio';

export function Rodape() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div style={{ marginBottom: 28 }}>
          <Logo altura={34} />
        </div>
        <nav className="footer-nav">
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
    </footer>
  );
}
