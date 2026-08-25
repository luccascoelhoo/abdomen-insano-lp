import Image from 'next/image';
import { Reveal } from '@/components/ui/Reveal';
import { expert } from '@/content/desafio';

/**
 * Ícones dos bullets de antes/depois. X em vermelho na coluna "de um lado"
 * e check laranja no "do outro" — mesma linguagem visual da referência.
 */
function IconeX() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 8l8 8M16 8l-8 8" />
    </svg>
  );
}
function IconeCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12.5l3 3 5-6" />
    </svg>
  );
}

export function Expert() {
  return (
    <section className="sec sec--alt idealizador">
      <div className="wrap idealizador__wrap">
        <Reveal as="h2" className="idealizador__titulo">
          {expert.tituloAntes}
          <span>{expert.tituloDestaque}</span>
        </Reveal>

        <div className="idealizador__fotos">
          <Reveal className="idealizador__foto">
            <Image
              src={expert.fotoAntes}
              alt="Igor Correa antes do desafio"
              width={1080}
              height={1920}
              sizes="(min-width: 760px) 30vw, 45vw"
            />
          </Reveal>
          <Reveal className="idealizador__foto" delay={120}>
            <Image
              src={expert.fotoHoje}
              alt="Igor Correa hoje"
              width={1080}
              height={1920}
              sizes="(min-width: 760px) 30vw, 45vw"
            />
          </Reveal>
        </div>

        <div className="idealizador__listas">
          <Reveal className="idealizador__coluna idealizador__coluna--x">
            <p className="idealizador__coluna-titulo">{expert.antesTitulo}</p>
            <ul>
              {expert.antes.map((item) => (
                <li key={item}>
                  <span className="idealizador__icone" aria-hidden="true"><IconeX /></span>
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal className="idealizador__coluna idealizador__coluna--check" delay={120}>
            <p className="idealizador__coluna-titulo">{expert.hojeTitulo}</p>
            <ul>
              {expert.hoje.map((item) => (
                <li key={item}>
                  <span className="idealizador__icone" aria-hidden="true"><IconeCheck /></span>
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <div className="idealizador__historia">
          <Reveal as="p">
            Meu nome é <b>{expert.nome}</b>.
          </Reveal>
          {expert.historia.map((paragrafo, i) => (
            <Reveal as="p" key={paragrafo.slice(0, 32)} delay={80 + i * 60}>
              {paragrafo}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
