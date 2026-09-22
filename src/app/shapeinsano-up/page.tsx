import type { Metadata } from 'next';
import { PaginaFunil } from '@/components/funil/PaginaFunil';
import { PurchaseTracker } from '@/components/ui/PurchaseTracker';
import { upsell } from '@/content/desafio';
import { destinoRecusaUpsell } from '@/lib/funil';
import { idDaTransacao } from '@/lib/transacao';

export const metadata: Metadata = {
  title: upsell.metaTitulo,
  robots: { index: false, follow: false },
};

/**
 * Upsell — primeira parada depois do checkout do Desafio.
 *
 * Com o funil ativo, o checkout devolve o comprador aqui e não no /obrigado —
 * então o `Purchase` de navegador da compra que acabou de acontecer precisa
 * sair daqui, pela mesma trilha do /obrigado (`PurchaseTracker`).
 */
export default async function UpsellPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const transacaoId = idDaTransacao(await searchParams) ?? undefined;

  return (
    <>
      <PurchaseTracker transacaoId={transacaoId} />
      <PaginaFunil pagina={upsell} destinoRecusa={destinoRecusaUpsell()} />
    </>
  );
}
