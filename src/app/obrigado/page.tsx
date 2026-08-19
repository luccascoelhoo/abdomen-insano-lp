import type { Metadata } from 'next';
import { Logo } from '@/components/ui/Logo';
import { CadastroFluxo } from '@/components/sections/CadastroFluxo';

export const metadata: Metadata = {
  title: 'Compra aprovada — Desafio Abdômen Insano',
  description:
    'Cadastre sua conta pra liberar o acesso ao Desafio Abdômen Insano no aplicativo.',
  robots: { index: false, follow: false },
};

/**
 * Página que o Cakto redireciona depois do pagamento. Fluxo:
 *   1. Recebe email + transaction_id na query.
 *   2. Verifica no backend que a compra existe e está aprovada.
 *   3. Cliente preenche cadastro (nome + senha).
 *   4. Backend valida de novo (é a fonte de verdade) e cria o usuário.
 *   5. Libera os botões App Store / Play Store.
 */
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
      <CadastroFluxo searchParamsPromise={searchParams} />
    </>
  );
}
