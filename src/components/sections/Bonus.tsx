import Image from 'next/image';
import { Reveal } from '@/components/ui/Reveal';
import { bonus, bonusSecao } from '@/content/desafio';

/**
 * Ícone circular de check, laranja preenchido — mesmo estilo do print de
 * referência da página modelo.
 */
function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M7 12.5l3.2 3.2L17 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function Bonus() {
  return (
    <section className="sec sec--dark bonus-sec" style={{ paddingTop: 0 }}>
      <div className="wrap bonus-layout">
        <Reveal className="bonus-layout__esq">
          <h2 className="bonus-titulo">
            {bonusSecao.titulo.split(bonusSecao.destaque).flatMap((parte, i, todos) => [
              parte,
              i < todos.length - 1 ? (
                <span key={i}>{bonusSecao.destaque}</span>
              ) : null,
            ])}
          </h2>

          <ul className="bonus-lista">
            {bonus.map((b, i) => (
              <Reveal as="li" key={b.titulo} className="bonus-lista__item" delay={120 + i * 80}>
                <span className="bonus-lista__check">
                  <CheckIcon />
                </span>
                <p>
                  <b>{b.titulo}:</b> {b.texto}
                </p>
              </Reveal>
            ))}
          </ul>
        </Reveal>

        {/* Dois mockups do app (Treino + Home) sobrepostos, com halo laranja
            atrás — mostra que o desafio vive dentro do aplicativo. */}
        <Reveal className="bonus-layout__dir" delay={200}>
          <div className="bonus-visual">
            <div className="bonus-visual__halo" aria-hidden="true" />
            <Image
              src="/img/bonus-mockup-1.webp"
              alt="Tela do app com a divisão de treinos da semana"
              width={1080}
              height={1920}
              quality={95}
              className="bonus-visual__mockup bonus-visual__mockup--tras"
              sizes="(min-width: 900px) 320px, 60vw"
            />
            <Image
              src="/img/bonus-mockup-2.webp"
              alt="Tela inicial do app com treino do dia e hábitos"
              width={1080}
              height={1920}
              quality={95}
              className="bonus-visual__mockup bonus-visual__mockup--frente"
              sizes="(min-width: 900px) 320px, 60vw"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
