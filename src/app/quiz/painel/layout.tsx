import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { logado } from '@/lib/quiz-painel';
import { SUPERFICIE, TEMA, TEXTO } from '@/lib/painel/tema';
import { FormSenha } from './FormSenha';
import { Menu } from './Menu';
import { sair } from './acoes';
import './painel.css';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Painel do quiz · Abdômen Insano',
  robots: { index: false, follow: false },
};

const Marca = () => (
  <span className="inline-block h-3 w-3 rounded-[4px]" style={{ background: `linear-gradient(135deg, ${TEMA.marca}, #ffce3b)` }} aria-hidden="true" />
);

/** Porteiro dos painéis: sem sessão válida, só a tela de senha. Cada página confere de novo. */
export default async function PainelLayout({ children }: { children: ReactNode }) {
  if (!(await logado())) {
    return (
      <div className="pn grid min-h-screen place-items-center p-6" style={{ background: SUPERFICIE.s0 }}>
        <div className="pn-login w-full max-w-[340px] rounded-[14px] border p-6" style={{ background: SUPERFICIE.s1, borderColor: SUPERFICIE.linha }}>
          <Marca />
          <h1 className="mt-3 text-[20px] font-semibold" style={{ color: TEXTO.t1 }}>Painel do quiz</h1>
          <p className="mt-1 text-[13px]" style={{ color: TEXTO.t3 }}>Desafio Abdômen Insano · acesso restrito à equipe.</p>
          <FormSenha />
        </div>
      </div>
    );
  }
  return (
    <div className="pn min-h-screen" style={{ background: SUPERFICIE.s0, color: TEXTO.t1 }}>
      <header className="sticky top-0 z-10 border-b backdrop-blur" style={{ borderColor: SUPERFICIE.linha, background: 'rgba(0,0,0,0.82)' }}>
        <div className="mx-auto flex max-w-[1100px] items-center gap-4 px-4 py-3">
          <span className="flex shrink-0 items-center gap-2 text-[14px] font-semibold">
            <Marca />
            Abdômen Insano
          </span>
          <Menu />
          <form action={sair} className="ml-auto shrink-0">
            <button type="submit" className="rounded-[8px] px-3 py-1.5 text-[12px]" style={{ color: TEXTO.t3, border: `1px solid ${SUPERFICIE.linha}` }}>
              Sair
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-[1100px] px-4 py-6">{children}</main>
    </div>
  );
}
