import type { Metadata } from 'next';
import { PaginaFunil } from '@/components/funil/PaginaFunil';
import { PurchaseTracker } from '@/components/ui/PurchaseTracker';
import { downsell } from '@/content/desafio';
import { destinoRecusaDownsell } from '@/lib/funil';
import { idDaTransacao } from '@/lib/transacao';

export const metadata: Metadata = {
  title: downsell.metaTitulo,
  robots: { index: false, follow: false },
};

/**
 * Downsell — para quem recusou o upsell: mesmo produto, 25% mais barato.
 *
 * Com o funil ativo, o checkout devolve o comprador aqui e não no /obrigado —
 * então o `Purchase` de navegador da compra que acabou de acontecer precisa
 * sair daqui, pela mesma trilha do /obrigado (`PurchaseTracker`).
 */
export default async function DownsellPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const transacaoId = idDaTransacao(await searchParams) ?? undefined;

  return (
    <>
      <PurchaseTracker transacaoId={transacaoId} />
      <PaginaFunil pagina={downsell} destinoRecusa={destinoRecusaDownsell()} />
    </>
  );
}
