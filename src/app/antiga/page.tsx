import { Beneficios } from '@/components/sections/Beneficios';
import { Bonus } from '@/components/sections/Bonus';
import { Depoimentos } from '@/components/sections/Depoimentos';
import { Entregaveis } from '@/components/sections/Entregaveis';
import { Expert } from '@/components/sections/Expert';
import { Faq } from '@/components/sections/Faq';
import { Hero } from '@/components/sections/Hero';
import { Inspira } from '@/components/sections/Inspira';
import { Metodo } from '@/components/sections/Metodo';
import { Oferta } from '@/components/sections/Oferta';
import { Rodape } from '@/components/sections/Rodape';
import { Suporte } from '@/components/sections/Suporte';
import { ViewContentWatcher } from '@/components/ui/ViewContentWatcher';
import { oferta } from '@/content/desafio';
import type { Metadata } from 'next';
/**
 * A LP anterior ao redesenho (V.1), guardada aqui em 29/10/2026 — a oficial
 * passa a ser a V.2. Mesmo conteúdo e mesmos componentes da home de então.
 *
 * Fora do índice e sem link de lugar nenhum: serve só pra consulta e pra poder
 * voltar atrás. O código dela também está preservado na etiqueta `lp-v1-antiga`
 * do Git.
 */
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function LpAntiga() {
  return (
    <>
      <ViewContentWatcher moeda={oferta.precoMoeda} />
      <Hero />
      <Metodo />
      <Inspira />
      <Depoimentos />
      <Beneficios />
      <Entregaveis />
      <Bonus />
      <Oferta />
      <Expert />
      <Faq />
      <Suporte />
      <Rodape />
    </>
  );
}
