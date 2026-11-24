import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { logado } from '@/lib/quiz-painel';
import { SUPERFICIE, TEXTO } from '@/lib/painel/tema';
import { FormSenha } from './FormSenha';
import { Menu } from './Menu';
import { AutoAtualizar } from './_ui/AutoAtualizar';
import { sair } from './acoes';
import './painel.css';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Painel · Abdômen Insano',
  robots: { index: false, follow: false },
  // Ícone próprio: a aba do painel não se confunde com a do site aberta ao lado.
  icons: { icon: '/img/logo-icone-laranja.svg', apple: '/img/logo-icone-laranja.svg' },
};

/**
 * O logo horizontal do Desafio. O SVG tem respiro largo em cima e embaixo
 * (viewBox 1440 × 810), então a altura da caixa é maior que a do desenho.
 */
const Logo = ({ altura }: { altura: number }) => (
  // eslint-disable-next-line @next/next/no-img-element -- SVG estático da marca, sem ganho do otimizador
  <img src="/img/logo-desafio.svg" alt="Desafio Abdômen Insano" height={altura} width={Math.round((altura * 1440) / 810)} style={{ height: altura, width: 'auto' }} />
);

/** Porteiro dos painéis: sem sessão válida, só a tela de senha. Cada página confere de novo. */
export default async function PainelLayout({ children }: { children: ReactNode }) {
  if (!(await logado())) {
    return (
      <div className="pn grid min-h-screen place-items-center p-6" style={{ background: SUPERFICIE.s0 }}>
        <div className="pn-login w-full max-w-[340px] rounded-[14px] border p-6" style={{ background: SUPERFICIE.s1, borderColor: SUPERFICIE.linha }}>
          <div className="-mx-2 -mt-3 flex justify-center">
            <Logo altura={120} />
          </div>
          <h1 className="mt-1 text-center text-[18px] font-semibold" style={{ color: TEXTO.t1 }}>Painel do quiz</h1>
          <p className="mt-1 text-center text-[13px]" style={{ color: TEXTO.t3 }}>Acesso restrito à equipe.</p>
          <FormSenha />
        </div>
      </div>
    );
  }
  return (
    <div className="pn min-h-screen" style={{ background: SUPERFICIE.s0, color: TEXTO.t1 }}>
      <header className="sticky top-0 z-10 border-b backdrop-blur" style={{ borderColor: SUPERFICIE.linha, background: 'rgba(0,0,0,0.82)' }}>
        <div className="mx-auto flex max-w-[1100px] flex-wrap items-center gap-x-5 px-4 py-1.5 sm:flex-nowrap">
          <a href="/quiz/painel" className="-my-1 shrink-0" aria-label="Painel do quiz · início">
            <Logo altura={52} />
          </a>
          {/* No celular o menu desce para a própria linha, inteira e rolável; no desktop fica entre o logo e o Sair. */}
          <div className="order-3 -mx-4 w-[calc(100%+2rem)] overflow-x-auto px-4 pb-2 sm:order-none sm:mx-0 sm:w-auto sm:px-0 sm:pb-0">
            <Menu />
          </div>
          <form action={sair} className="ml-auto shrink-0">
            <button type="submit" className="rounded-[8px] px-3 py-1.5 text-[12px]" style={{ color: TEXTO.t3, border: `1px solid ${SUPERFICIE.linha}` }}>
              Sair
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-[1100px] px-4 py-6">{children}</main>
      <footer className="mx-auto max-w-[1100px] px-4 pb-8 pt-2 text-[12px]" style={{ color: TEXTO.t3 }}>
        Painel interno · Desafio Abdômen Insano · horários em Brasília · atualiza sozinho a cada minuto
      </footer>
      <AutoAtualizar />
    </div>
  );
}
