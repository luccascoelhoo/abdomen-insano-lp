import type { Metadata } from 'next';
import { LpV3 } from '@/components/v3/LpV3';

/**
 * LP V.3 "Capa Zero", em revisão. Fora do índice e sem link de lugar nenhum:
 * vira a home trocando uma linha em `app/page.tsx` quando for aprovada.
 */
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default LpV3;
