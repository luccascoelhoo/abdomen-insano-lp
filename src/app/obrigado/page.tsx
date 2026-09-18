import type { Metadata } from 'next';
import { Logo } from '@/components/ui/Logo';
import { ObrigadoConteudo } from '@/components/sections/ObrigadoConteudo';
import { PurchaseTracker } from '@/components/ui/PurchaseTracker';
import { idDaTransacao } from '@/lib/transacao';

export const metadata: Metadata = {
  title: 'Compra aprovada — Desafio Abdômen Insano',
  description:
    'Sua compra foi aprovada. Siga os passos para acessar o Desafio Abdômen Insano.',
  robots: { index: false, follow: false },
};

/**
 * A query da URL de retorno, com os nomes que o gateway pode usar para a mesma
 * coisa. O identificador da transação não é lido campo a campo aqui: quem
 * escolhe é `idDaTransacao`, a mesma função que o webhook usa do outro lado.
 */
type QueryObrigado = Record<string, string | undefined> & {
  email?: string;
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
  const transacaoId = idDaTransacao(query) ?? undefined;
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
