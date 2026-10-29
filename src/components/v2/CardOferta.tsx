import Image from 'next/image';
import { CtaButton } from '@/components/ui/CtaButton';
import { ofertaV2, telasApp } from '@/content/lp-v2';
import { reais, type Parcelamento } from '@/lib/parcelamento';
import { CelularApp } from './CelularApp';
import { IconeCheck } from './Icones';

/** Celular parado com uma tela real do app, pros lados da vitrine. */
function CelularParado({ src, className }: { src: string; className: string }) {
  return (
    <div className={`v2-celular ${className}`}>
      <div className="v2-celular__tela">
        <Image className="v2-celular__quadro is-ativa" src={src} alt="" width={540} height={1200} sizes="130px" />
      </div>
    </div>
  );
}

/** Capa de e-book feita em CSS, pros bônus que são guias. */
function Livro({ rotulo, titulo, className }: { rotulo: string; titulo: string; className: string }) {
  return (
    <div className={`v2-kit__livro ${className}`}>
      <span className="v2-kit__livro-rotulo">{rotulo}</span>
      <span className="v2-kit__livro-titulo">{titulo}</span>
      <Image src="/img/logo-desafio.svg" alt="" width={70} height={39} className="v2-kit__livro-logo" />
    </div>
  );
}

/**
 * O card de compra, no molde do da referência: o "kit" (celulares com telas
 * reais, os guias bônus e o selo do desafio) saindo por cima do card, o que a
 * pessoa recebe, o preço em destaque e o botão verde.
 *
 * O parcelamento chega da página (lido da Cakto). O botão é o `CtaButton` de
 * sempre — mesmo checkout, mesmas UTMs e a mesma medição do InitiateCheckout;
 * só o `origem` muda, pra saber de qual card veio o clique.
 */
export function CardOferta({ parcelamento, origem }: { parcelamento: Parcelamento; origem: string }) {
  const c = ofertaV2.card;
  return (
    <div className="v2-card-oferta">
      <div className="v2-kit">
        <Livro rotulo="Guia" titulo="Fim de Semana Sem Culpa" className="v2-kit__livro--esq" />
        <Livro rotulo="Protocolo" titulo="Anti-Inchaço" className="v2-kit__livro--dir" />
        <CelularParado src="/img/app/dieta.webp" className="v2-kit__cel v2-kit__cel--esq" />
        <CelularParado src="/img/app/serie.webp" className="v2-kit__cel v2-kit__cel--dir" />
        <CelularApp
          telas={telasApp.vitrine}
          rotulo="O app do desafio: treino, séries e dieta"
          pontos={false}
          className="v2-kit__cel v2-kit__cel--centro"
        />
        <div className="v2-kit__selo" aria-hidden="true">
          <Image src="/img/logo-desafio.svg" alt="" width={88} height={50} />
        </div>
      </div>

      <div className="v2-card-oferta__corpo">
        <p className="v2-card-oferta__rotulo">{c.recebeTitulo}</p>
        <ul className="v2-checks v2-checks--card">
          {c.recebe.map((i) => (
            <li key={i}>
              <IconeCheck />
              <span>{i}</span>
            </li>
          ))}
        </ul>
        <p className="v2-card-oferta__rotulo">{c.bonusTitulo}</p>
        <ul className="v2-checks v2-checks--card">
          {c.bonus.map((i) => (
            <li key={i}>
              <IconeCheck />
              <span>{i}</span>
            </li>
          ))}
        </ul>

        <div className="v2-preco">
          <p className="v2-preco__de">
            Tudo isso, de <s>{c.precoDe}</s> por apenas…
          </p>
          <p className="v2-preco__parcela">
            <span className="v2-preco__vezes">
              {parcelamento.vezes}x
              <br />
              de
            </span>
            <span className="v2-preco__valor">R$ {reais(parcelamento.parcelaCentavos)}</span>
          </p>
          <p className="v2-preco__avista">
            ou <b>R$ {reais(parcelamento.avistaCentavos)}</b> à vista
          </p>
        </div>

        <p className="v2-card-oferta__provoca">{c.provocacao}</p>
        <CtaButton className="v2-cta" origem={origem}>
          {c.cta}
        </CtaButton>

      </div>
    </div>
  );
}
