'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SUPERFICIE, TEMA, TEXTO } from '@/lib/painel/tema';

const ABAS = [
  { href: '/quiz/painel', rotulo: 'Painel' },
  { href: '/quiz/painel/respostas', rotulo: 'Respostas' },
  { href: '/quiz/painel/leads', rotulo: 'Leads' },
  { href: '/quiz/painel/origens', rotulo: 'Origens' },
  { href: '/quiz/painel/medicao', rotulo: 'Medição' },
];

export function Menu() {
  const atual = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto" aria-label="Seções do painel">
      {ABAS.map((a) => {
        const ativo = a.href === '/quiz/painel' ? atual === a.href : atual.startsWith(a.href);
        return (
          <Link
            key={a.href}
            href={a.href}
            aria-current={ativo ? 'page' : undefined}
            className="whitespace-nowrap rounded-[8px] px-3 py-1.5 text-[13px] font-medium"
            style={{ background: ativo ? SUPERFICIE.s3 : 'transparent', color: ativo ? TEXTO.t1 : TEXTO.t3, boxShadow: ativo ? `inset 0 -2px 0 ${TEMA.marca}` : undefined }}
          >
            {a.rotulo}
          </Link>
        );
      })}
    </nav>
  );
}
