import type { Metadata } from 'next';
import { Logo } from '@/components/ui/Logo';
import { ObrigadoConteudo } from '@/components/sections/ObrigadoConteudo';
import { PurchaseTracker } from '@/components/ui/PurchaseTracker';

export const metadata: Metadata = {
  title: 'Compra aprovada — Desafio Abdômen Insano',
  description:
    'Sua compra foi aprovada. Siga os passos para acessar o Desafio Abdômen Insano.',
  robots: { index: false, follow: false },
};

type QueryObrigado = {
  email?: string;
  transaction_id?: string;
  tx?: string;
  /** Alguns gateways devolvem o total pago na volta; quando vem, ele manda. */
  amount?: string;
  valor?: string;
};

export default async function ObrigadoPage({
  searchParams,
}: {
  searchParams: Promise<QueryObrigado>;
}) {
  const query = await searchParams;
  const transacaoId = query.transaction_id ?? query.tx;
  const bruto = Number((query.amount ?? query.valor ?? '').replace(',', '.'));
  const valor = Number.isFinite(bruto) && bruto > 0 ? bruto : undefined;

  return (
    <>
      <PurchaseTracker transacaoId={transacaoId} valor={valor} />
      <header className="topbar">
        <Logo altura={26} />
      </header>
      <ObrigadoConteudo searchParamsPromise={searchParams} />
    </>
  );
}
