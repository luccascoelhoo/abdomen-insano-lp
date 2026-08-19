import { Ancoragem } from '@/components/sections/Ancoragem';
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
import { Reafirmacao } from '@/components/sections/Reafirmacao';
import { Rodape } from '@/components/sections/Rodape';
import { Suporte } from '@/components/sections/Suporte';
import { Logo } from '@/components/ui/Logo';
import { Pista } from '@/components/ui/Pista';
import { StickyCta } from '@/components/ui/StickyCta';
import { CTA_STICKY_MOBILE } from '@/lib/flags';

export default function Home() {
  return (
    <>
      <header className="topbar">
        <Logo altura={26} />
      </header>

      <Hero />
      <Pista />
      <Metodo />
      <Inspira />
      <Depoimentos />
      <Beneficios />
      <Entregaveis />
      <Bonus />
      <Ancoragem />
      <Oferta />
      <Expert />
      <Faq />
      <Reafirmacao />
      <Suporte />
      <Rodape />

      {CTA_STICKY_MOBILE && <StickyCta />}
    </>
  );
}
