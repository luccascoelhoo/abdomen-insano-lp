import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { logado } from '@/lib/quiz-painel';
import { FormSenha } from './FormSenha';
import { Menu } from './Menu';
import { sair } from './acoes';
import './painel.css';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Painel do quiz',
  robots: { index: false, follow: false },
};

/** Porteiro dos painéis: sem sessão válida, só a tela de senha. */
export default async function PainelLayout({ children }: { children: ReactNode }) {
  if (!(await logado())) {
    return (
      <div className="pn pn-login">
        <div className="pn-login__cartao">
          <span className="pn-marca" aria-hidden="true" />
          <h1>Painel do quiz</h1>
          <p>Acesso restrito à equipe.</p>
          <FormSenha />
        </div>
      </div>
    );
  }
  return (
    <div className="pn">
      <header className="pn-topo">
        <div className="pn-topo__dentro">
          <span className="pn-topo__titulo"><span className="pn-marca" aria-hidden="true" />Painel do quiz</span>
          <Menu />
          <form action={sair}>
            <button type="submit" className="pn-sair">Sair</button>
          </form>
        </div>
      </header>
      <main className="pn-main">{children}</main>
    </div>
  );
}
