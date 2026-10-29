import Image from 'next/image';
import { heroV2 } from '@/content/lp-v2';
import { IconeChevrons } from './Icones';
import { Rico } from './Rico';

/** [1] Topo escuro: foto, headline em duas cores e o "Aceita o desafio?" sem link. */
export function HeroV2() {
  return (
    <section className="v2-hero">
      <div className="v2-col">
        <Image
          className="v2-hero__logo"
          src="/img/logo-desafio.svg"
          alt="Desafio Abdômen Insano"
          width={176}
          height={99}
          priority
        />
        <div className="v2-hero__foto">
          <Image
            src={heroV2.foto.src}
            alt={heroV2.foto.alt}
            width={heroV2.foto.width}
            height={heroV2.foto.height}
            sizes="(max-width: 720px) 100vw, 680px"
            priority
          />
        </div>
        <h1 className="v2-hero__titulo">
          <span className="v2-acento">{heroV2.tituloDestaque}</span> {heroV2.tituloResto}
        </h1>
        <p className="v2-hero__sub">
          <Rico texto={heroV2.sub} />
        </p>
        {/* Sem link de propósito: não rola até o preço (decisão de 24/10/2026). */}
        <p className="v2-hero__provoca">{heroV2.provocacao}</p>
        <IconeChevrons className="v2-hero__seta" />
      </div>
    </section>
  );
}
