import type { Metadata } from 'next';
import { TestePlayer } from './TestePlayer';

export const metadata: Metadata = {
  title: 'Teste do player',
  robots: { index: false, follow: false },
};

/** Página de teste do Player Insano. Não é linkada em lugar nenhum. */
export default function PlayerTestePage() {
  return <TestePlayer />;
}
