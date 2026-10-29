import Image from 'next/image';
import { CtaButton } from '@/components/ui/CtaButton';
import { ofertaV2 } from '@/content/lp-v2';
import { reais, type Parcelamento } from '@/lib/parcelamento';
import { IconeCheck } from './Icones';

/**
 * O card de compra, no molde do da referência: vitrine do app em cima, o que
 * a pessoa recebe, o preço em destaque e o botão verde.
 *
 * O parcelamento chega da página (lido da Cakto). O botão é o `CtaButton` de
 * sempre — mesmo checkout, mesmas UTMs e a mesma medição do InitiateCheckout;
 * só o `origem` muda, pra saber de qual card veio o clique.
 */
export function CardOferta({ parcelamento, origem }: { parcelamento: Parcelamento; origem: string }) {
  const c = ofertaV2.card;
  return (
    <div className="v2-card-oferta">
      <div className="v2-card-oferta__vitrine" aria-hidden="true">
        <Image src="/img/bonus-mockup-2.webp" alt="" width={1080} height={1920} sizes="150px" className="v2-card-oferta__tela v2-card-oferta__tela--1" />
        <Image src="/img/bonus-mockup-1.webp" alt="" width={1080} height={1920} sizes="150px" className="v2-card-oferta__tela v2-card-oferta__tela--2" />
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

        <p className="v2-prova">
          <span className="v2-prova__avatares" aria-hidden="true">
            {[1, 2, 3, 4].map((n) => (
              <Image key={n} src={`/img/avatar-${n}.jpg`} alt="" width={120} height={120} sizes="28px" />
            ))}
          </span>
          {c.prova}
        </p>
      </div>
    </div>
  );
}
