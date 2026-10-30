import Image from 'next/image';
import type { ReactNode } from 'react';
import { Rico } from '@/components/v2/Rico';
import { heroV3 } from '@/content/lp-v3';
import '@/app/v3/hero.css';

/**
 * O topo da V.3: banner do Igor, selo de alunos, headline e lead, até o
 * "Aceita o desafio?". É o topo da home e o da /v3.
 *
 * Na home ele termina na provocação, sem botão nem preço (pedido do Igor em
 * 29/10/2026). A /v3 passa o botão, o preço e os selos de confiança em
 * `children`, que entram logo abaixo.
 */
export function HeroV3({ children }: { children?: ReactNode }) {
  const h = heroV3;
  return (
    <section className="v3-hero">
      <div className="v3-hero__foto">
        <Image src={h.foto.src} alt={h.foto.alt} width={h.foto.width} height={h.foto.height} sizes="(max-width: 900px) 100vw, 50vw" priority />
        <Image className="v3-hero__logo" src="/img/logo-desafio.svg" alt="Desafio Abdômen Insano" width={140} height={79} />
      </div>
      <div className="v3-hero__texto">
        <div className="prova-pill v3-pill">
          <span className="prova-pill__avatares" aria-hidden="true">
            <span className="prova-pill__av prova-pill__av--1" />
            <span className="prova-pill__av prova-pill__av--2" />
            <span className="prova-pill__av prova-pill__av--3" />
            <span className="prova-pill__av prova-pill__av--4" />
          </span>
          <span className="prova-pill__txt">
            <b>{h.prova.numero}</b> {h.prova.texto}
          </span>
        </div>
        <h1 className="v3-hero__titulo">
          <span className="v2-acento">{h.tituloDestaque}</span> {h.tituloResto}
        </h1>
        <p className="v3-hero__sub">
          <Rico texto={h.sub} />
        </p>
        <p className="v3-hero__provoca">{h.provocacao}</p>
        {children}
      </div>
    </section>
  );
}
