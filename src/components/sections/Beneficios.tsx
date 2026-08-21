import Image from 'next/image';
import { Reveal } from '@/components/ui/Reveal';
import { beneficios, beneficiosSecao } from '@/content/desafio';

/**
 * Ícones em line-art (OpenMoji Black + SVG custom pro abdômen).
 * Ordem casa com `beneficios`: bíceps · abdômen · pessoa em pé · óculos.
 * CSS aplica invert() pra render branco no fundo laranja.
 */
const ICONES = [
  '/img/icones/1F4AA.svg',
  '/img/icones/abdomen.svg',
  '/img/icones/1F9CD.svg',
  '/img/icones/1F60E.svg',
] as const;

export function Beneficios() {
  return (
    <section className="sec beneficios-sec">
      <div className="wrap">
        <div className="beneficios-card">
          <header className="beneficios-card__header">
            <Reveal as="h2" className="beneficios-card__titulo">
              Por que um <span>abdômen insano é essencial?</span>
            </Reveal>
            <Reveal as="p" className="beneficios-card__lead" delay={120}>
              {beneficiosSecao.lead}
            </Reveal>
          </header>

          <div className="beneficios-grid">
            {beneficios.map((b, i) => (
              <Reveal className="beneficio-card" key={b.titulo} delay={(i % 2) * 90}>
                <span className="beneficio-card__icone" aria-hidden="true">
                  <Image src={ICONES[i]} alt="" width={40} height={40} />
                </span>
                <h3 className="beneficio-card__titulo">{b.titulo}</h3>
                <p className="beneficio-card__texto">{b.texto}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
