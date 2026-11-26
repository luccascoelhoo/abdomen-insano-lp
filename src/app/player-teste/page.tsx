import type { Metadata } from 'next';
import { TestePlayer } from './TestePlayer';

export const metadata: Metadata = {
  title: 'Teste do player',
  robots: { index: false, follow: false },
};

/**
 * Página de teste do Player Insano. Não é linkada em lugar nenhum.
 * `?modo=completo` liga todos os recursos do player de uma vez;
 * `?modo=filtro` testa o filtro de tráfego (passa só com `&chave=ok`).
 */
export default async function PlayerTestePage({
  searchParams,
}: {
  searchParams: Promise<{ modo?: string | string[] }>;
}) {
  const { modo } = await searchParams;
  return <TestePlayer completo={modo === 'completo'} filtro={modo === 'filtro'} />;
}
