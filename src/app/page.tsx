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
export default function Home() {
  return (
    <>
      <ViewContentWatcher valor={oferta.precoNumero} moeda={oferta.precoMoeda} />
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
