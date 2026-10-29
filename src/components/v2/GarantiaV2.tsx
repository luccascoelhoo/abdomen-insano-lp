import { CtaButton } from '@/components/ui/CtaButton';
import { garantiaV2 } from '@/content/lp-v2';
import { Rico } from './Rico';

/** [10] Garantia de 15 dias — selo, o texto e o botão que a copy pede ("clique no botão abaixo"). */
export function GarantiaV2() {
  const g = garantiaV2;
  return (
    <section className="v2-sec v2-sec--garantia">
      <div className="v2-col">
        <div className="v2-selo" aria-hidden="true">
          <span className="v2-selo__numero">{g.selo.numero}</span>
          <span className="v2-selo__rotulo">{g.selo.rotulo}</span>
        </div>
        <h2 className="v2-h2 v2-centro v2-garantia__titulo">{g.titulo}</h2>
        <div className="v2-texto">
          {g.paragrafos.map((p) => (
            <p key={p}>
              <Rico texto={p} />
            </p>
          ))}
          <p>
            {g.emailAntes}
            <a className="v2-link" href={`mailto:${g.email}`}>
              {g.email}
            </a>
            {g.emailDepois}
          </p>
          {g.paragrafosFinais.map((p) => (
            <p key={p}>
              <Rico texto={p} />
            </p>
          ))}
        </div>
        <CtaButton className="v2-cta" origem="v2-garantia">
          {g.cta}
        </CtaButton>
        <p className="v2-oferta__lema v2-centro">{g.lema}</p>
      </div>
    </section>
  );
}
