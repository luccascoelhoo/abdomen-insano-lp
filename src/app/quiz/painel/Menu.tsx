'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Menu() {
  const atual = usePathname();
  const aba = (href: string, texto: string, ativo: boolean) => (
    <Link href={href} className={`pn-aba${ativo ? ' pn-aba--ativa' : ''}`} aria-current={ativo ? 'page' : undefined}>
      {texto}
    </Link>
  );
  const nosLeads = atual.startsWith('/quiz/painel/leads');
  return (
    <nav className="pn-abas" aria-label="Seções do painel">
      {aba('/quiz/painel', 'Funil', !nosLeads)}
      {aba('/quiz/painel/leads', 'Leads', nosLeads)}
    </nav>
  );
}
