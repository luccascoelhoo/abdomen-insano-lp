import type { Metadata } from 'next';
import { Quiz } from '@/components/quiz/Quiz';
import { BlocoOfertaQuiz } from '@/components/quiz/BlocoOfertaQuiz';
import { ofertaV2 } from '@/content/lp-v2';
import { parcelamentoDaOferta } from '@/lib/parcelamento';
import { ID_FRONT, produtoPorId } from '@/lib/produtos';
import '@/app/v2/v2.css';
import './quiz.css';
import './resultado.css';
import './oferta.css';
import './controles.css';

export const metadata: Metadata = {
  title: 'Descubra o que está escondendo o seu abdômen | Desafio Abdômen Insano',
  description: 'Responda em 2 minutos e receba o seu Plano Capa Zero de 42 dias.',
  // Página de anúncio: fora do Google para não competir com a home.
  robots: { index: false, follow: true },
};

/**
 * Quiz sem VSL (formato 1 de 4). As telas são dados (`content/quiz.ts`); a
 * oferta final é renderizada aqui no servidor (preço vivo da Cakto) e entra no
 * quiz como `oferta`.
 */
export default async function PaginaQuiz() {
  const slug = produtoPorId(ID_FRONT)?.oferta;
  const parcelamento = (slug ? await parcelamentoDaOferta(slug) : null) ?? ofertaV2.card.reserva;
  return <Quiz oferta={<BlocoOfertaQuiz parcelamento={parcelamento} />} />;
}
