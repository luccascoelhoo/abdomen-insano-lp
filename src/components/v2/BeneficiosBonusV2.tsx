import Image from 'next/image';
import { beneficiosV2, bonusV2 } from '@/content/lp-v2';
import { IconeCheck } from './Icones';
import { Rico } from './Rico';
import { ValidoAte } from './ValidoAte';

/**
 * [7] Benefícios e [8] Bônus — no mesmo fundo claro, como na referência
 * ("Ao final dos 40 dias…" seguido de "Hoje é o seu dia de sorte").
 */
export function BeneficiosBonusV2() {
  return (
    <section className="v2-sec v2-sec--branco">
      <div className="v2-col">
        {/* O GIF virou vídeo mudo em loop: 44 MB → ~1 MB, mesma imagem. */}
        <video
          className="v2-transformacao"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster="/video/transformacao-poster.webp"
          aria-label="Dia 01, dia 42 e 1 ano: a transformação de quem faz o desafio"
        >
          <source src="/video/transformacao.mp4" type="video/mp4" />
          <source src="/video/transformacao.webm" type="video/webm" />
        </video>
        <h2 className="v2-h2">
          {beneficiosV2.titulo}{' '}
          <span className="v2-acento">
            <Rico texto={beneficiosV2.tituloDestaque} />
          </span>
        </h2>
        <ul className="v2-checks">
          {beneficiosV2.itens.map((b) => (
            <li key={b}>
              <IconeCheck />
              <span>
                <Rico texto={b} />
              </span>
            </li>
          ))}
        </ul>

        <div className="v2-bonus-topo">
          <h2 className="v2-h2 v2-acento">{bonusV2.titulo}</h2>
          <p className="v2-bonus-topo__sub">{bonusV2.sub}</p>
          <ValidoAte />
        </div>

        <div className="v2-bonus-grade v2-bonus-grade--livros">
          {bonusV2.itens.map((b) => (
            <article key={b.titulo} className="v2-bonus v2-bonus--livro">
              <div className="v2-livro" aria-hidden="true">
                <div className="v2-livro__capa">
                  <Image
                    src={b.capa.foto}
                    alt=""
                    fill
                    sizes="150px"
                    className="v2-livro__foto"
                    style={{ objectPosition: b.capa.posicao }}
                  />
                  <span className="v2-livro__titulo">
                    <Rico texto={b.capa.titulo} />
                  </span>
                  <Image src="/img/logo-desafio.svg" alt="" width={70} height={39} className="v2-livro__logo" />
                </div>
              </div>
              <div className="v2-bonus__texto">
                <span className="v2-bonus__rotulo">{b.rotulo}</span>
                <h3 className="v2-h3">{b.titulo}</h3>
                <p>{b.texto}</p>
                <p className="v2-bonus__preco">
                  {b.valor && <s>{b.valor}</s>}
                  <b>GRÁTIS</b>
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
