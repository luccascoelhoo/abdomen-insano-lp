import Image from 'next/image';
import { CardOferta } from '@/components/v2/CardOferta';
import { CarrosselCasos } from '@/components/v2/CarrosselCasos';
import { CelularApp } from '@/components/v2/CelularApp';
import { RodapeV2, SuporteV2 } from '@/components/v2/FinalV2';
import { IconeCheck, IconeX } from '@/components/v2/Icones';
import { Rico } from '@/components/v2/Rico';
import { CtaButton } from '@/components/ui/CtaButton';
import { FaqItem } from '@/components/ui/FaqItem';
import { ViewContentWatcher } from '@/components/ui/ViewContentWatcher';
import { oferta } from '@/content/desafio';
import { ofertaV2 } from '@/content/lp-v2';
import { capaV3, faqV3, heroV3, igorV3, metodoV3, ofertaV3, provaV3, stickyV3 } from '@/content/lp-v3';
import { parcelamentoDaOferta, reais, type Parcelamento } from '@/lib/parcelamento';
import { ID_FRONT, produtoPorId } from '@/lib/produtos';
import { CapaDesenho } from './CapaDesenho';
import { StickyCta } from './StickyCta';
import '@/app/v2/v2.css';
import '@/app/v3/v3.css';

/**
 * LP V.3 "Capa Zero": a V.2 condensada em 7 seções, cada uma respondendo a
 * próxima dúvida de quem está lendo. Herda o visual da V.2 (`.v2`) e só
 * acrescenta o que é dela (`.v3`). Medição idêntica: ViewContentWatcher e
 * CtaButton, com `origem` própria em cada botão.
 */
export async function LpV3() {
  const slug = produtoPorId(ID_FRONT)?.oferta;
  const parcelamento = (slug ? await parcelamentoDaOferta(slug) : null) ?? ofertaV2.card.reserva;

  return (
    <div className="v2 v3">
      <ViewContentWatcher moeda={oferta.precoMoeda} />
      <Hero parcelamento={parcelamento} />
      <Capa />
      <Metodo />
      <Prova />
      <Oferta parcelamento={parcelamento} />
      <Igor />
      <Fim />
      <StickyCta parcelamento={parcelamento} texto={stickyV3.cta} />
    </div>
  );
}

/** [1] O que é: mecanismo na headline, preço e botão já na primeira tela. */
function Hero({ parcelamento }: { parcelamento: Parcelamento }) {
  const h = heroV3;
  return (
    <section className="v3-hero">
      <div className="v3-hero__foto">
        <Image src={h.foto.src} alt={h.foto.alt} width={h.foto.width} height={h.foto.height} sizes="(max-width: 900px) 100vw, 50vw" priority />
      </div>
      <div className="v3-hero__texto">
        <Image className="v3-hero__logo" src="/img/logo-desafio.svg" alt="Desafio Abdômen Insano" width={140} height={79} priority />
        <p className="v3-etiqueta">{h.etiqueta}</p>
        <h1 className="v3-hero__titulo">
          {h.titulo} <span className="v2-acento">{h.tituloDestaque}</span>
        </h1>
        <p className="v3-hero__sub">
          <Rico texto={h.sub} />
        </p>
        <div data-v3="topo">
          <CtaButton className="v2-cta" origem="v3-hero">
            {h.cta}
          </CtaButton>
        </div>
        <p className="v3-hero__preco">
          {parcelamento.vezes}x de R$ {reais(parcelamento.parcelaCentavos)} ou <b>R$ {reais(parcelamento.avistaCentavos)} à vista</b>
        </p>
        <ul className="v3-confianca">
          {h.confianca.map((c) => (
            <li key={c}>
              <IconeCheck />
              {c}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** [2] Por que não funcionou: a capa, desenhada, e as duas frentes numa tabela de três linhas. */
function Capa() {
  const c = capaV3;
  return (
    <section className="v2-sec v2-sec--claro">
      <div className="v2-col v3-capa-grade">
        <div>
          <p className="v3-etiqueta">{c.etiqueta}</p>
          <h2 className="v2-h2">
            <Rico texto={c.titulo} />
          </h2>
          <p>{c.texto}</p>
        </div>
        <CapaDesenho com={c.desenho.com} sem={c.desenho.sem} />
      </div>
      <div className="v2-col">
        <ul className="v3-frentes">
          {c.tabela.map((l) => (
            <li key={l.fez} className={l.funciona ? 'is-funciona' : undefined}>
              {l.funciona ? <IconeCheck /> : <IconeX />}
              <b>{l.fez}</b>
              <span>{l.acontece}</span>
            </li>
          ))}
        </ul>
        <p className="v3-fecho">
          <Rico texto={c.fecho} />
        </p>
      </div>
    </section>
  );
}

/** [3] Como funciona: três engrenagens e os três passos de entrada, com o app de verdade. */
function Metodo() {
  const m = metodoV3;
  return (
    <section className="v2-sec v2-sec--preto">
      <div className="v2-col v2-col--largo">
        <p className="v3-etiqueta v2-centro">{m.etiqueta}</p>
        <h2 className="v2-h2 v2-centro">
          <Rico texto={m.titulo} />
        </h2>
        <ol className="v3-engrenagens">
          {m.engrenagens.map((e) => (
            <li key={e.titulo}>
              <div className="v3-engrenagens__foto">
                <Image src={e.imagem.src} alt={e.imagem.alt} fill sizes="(max-width: 720px) 30vw, 300px" />
              </div>
              <div>
                <p className="v3-engrenagens__titulo">
                  <span>{e.numero}</span> {e.titulo}
                </p>
                <p>
                  <Rico texto={e.texto} />
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div className="v3-comeco">
          <CelularApp telas={m.telas} rotulo={m.telasRotulo} pontos={false} className="v3-comeco__celular" />
          <div>
            <h3 className="v3-comeco__titulo">{m.comecoTitulo}</h3>
            <ol className="v3-passos">
              {m.passos.map((p) => (
                <li key={p.titulo}>
                  <b>{p.titulo}</b>
                  <span>{p.texto}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

/** [4] Funciona com gente como eu: os casos num trilho só. */
function Prova() {
  return (
    <section className="v2-sec v2-sec--escuro">
      <div className="v2-col v2-col--largo">
        <h2 className="v2-h2 v2-centro">
          <Rico texto={provaV3.titulo} />
        </h2>
        <p className="v2-sub v2-centro">{provaV3.sub}</p>
        <CarrosselCasos casos={provaV3.casos} />
      </div>
    </section>
  );
}

/** [5] A oferta, uma vez só: card de compra, o detalhe dos bônus sob demanda e a garantia. */
function Oferta({ parcelamento }: { parcelamento: Parcelamento }) {
  const o = ofertaV3;
  return (
    <section className="v2-sec v2-sec--preto v2-oferta" id="oferta">
      <div className="v2-col v2-centro">
        <p className="v3-etiqueta">{o.etiqueta}</p>
        <h2 className="v2-h2">
          <Rico texto={o.titulo} />
        </h2>
        <p className="v2-sub">{o.sub}</p>
        <div data-v3="oferta">
          <CardOferta parcelamento={parcelamento} origem="v3-oferta" />
        </div>

        <details className="v3-bonus">
          <summary>{o.bonusTitulo}</summary>
          <ul>
            {o.bonus.map((b) => (
              <li key={b.titulo}>
                <p className="v3-bonus__titulo">
                  {b.titulo}
                  {b.valor && <s>{b.valor}</s>}
                </p>
                <p>{b.texto}</p>
              </li>
            ))}
          </ul>
        </details>

        <div className="v3-garantia">
          <div className="v2-selo" aria-hidden="true">
            <span className="v2-selo__numero">{o.garantia.numero}</span>
            <span className="v2-selo__rotulo">{o.garantia.rotulo}</span>
          </div>
          <div>
            <h3>{o.garantia.titulo}</h3>
            <p>
              <Rico texto={o.garantia.texto} />
            </p>
            <a className="v2-link" href={`mailto:${o.garantia.email}`}>
              {o.garantia.email}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/** [6] Quem está por trás, em três frases. */
function Igor() {
  const i = igorV3;
  return (
    <section className="v2-sec v2-sec--claro">
      <div className="v2-col v3-igor">
        <div className="v3-igor__fotos">
          {[i.antes, i.depois].map((l) => (
            <figure key={l.legenda}>
              <Image src={l.foto.src} alt={l.foto.alt} width={l.foto.width} height={l.foto.height} sizes="(max-width: 720px) 40vw, 200px" />
              <figcaption>{l.legenda}</figcaption>
            </figure>
          ))}
        </div>
        <div>
          <p className="v3-etiqueta">{i.etiqueta}</p>
          {i.texto.map((p) => (
            <p key={p}>
              <Rico texto={p} />
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

/** [7] As dúvidas que sobram, suporte e rodapé. */
function Fim() {
  return (
    <>
      <section className="v2-sec v2-sec--fim">
        <div className="v2-col">
          <h2 className="v2-h2 v2-centro">{faqV3.titulo}</h2>
          <div className="v2-faq">
            {faqV3.itens.map((f, n) => (
              <FaqItem key={f.pergunta} numero={String(n + 1).padStart(2, '0')} pergunta={f.pergunta} resposta={f.resposta} />
            ))}
          </div>
        </div>
      </section>
      <SuporteV2 />
      <RodapeV2 />
    </>
  );
}
