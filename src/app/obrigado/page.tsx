import type { Metadata } from 'next';
import { Logo } from '@/components/ui/Logo';
import { ObrigadoConteudo } from '@/components/sections/ObrigadoConteudo';

export const metadata: Metadata = {
  title: 'Compra aprovada — Desafio Abdômen Insano',
  description:
    'Sua compra foi aprovada. Siga os passos para acessar o Desafio Abdômen Insano.',
  robots: { index: false, follow: false },
};

export default function ObrigadoPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; transaction_id?: string; tx?: string }>;
}) {
  return (
    <>
      <header className="topbar">
        <Logo altura={26} />
      </header>
      <ObrigadoConteudo searchParamsPromise={searchParams} />
    </>
  );
}
