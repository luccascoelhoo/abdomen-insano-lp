import Image from 'next/image';
import { CelularApp } from '@/components/v2/CelularApp';
import { RodapeV2 } from '@/components/v2/FinalV2';
import { IconeCheck, IconeX } from '@/components/v2/Icones';
import { Rico } from '@/components/v2/Rico';
import { CtaButton } from '@/components/ui/CtaButton';
import { FaqItem } from '@/components/ui/FaqItem';
import { ViewContentWatcher } from '@/components/ui/ViewContentWatcher';
import { oferta, suporte } from '@/content/desafio';
import { ofertaV2, telasApp } from '@/content/lp-v2';
import {
  capaV3,
  ctaV3,
  faixaV3,
  faqV3,
  fechamentoV3,
  heroV3,
  igorV3,
  metodoV3,
  ofertaV3,
  provaV3,
} from '@/content/lp-v3';
import { parcelamentoDaOferta, reais, type Parcelamento } from '@/lib/parcelamento';
import { ID_FRONT, produtoPorId } from '@/lib/produtos';
import { CapaDesenho } from './CapaDesenho';
import { CarrosselV3 } from './CarrosselV3';
import { KitV3 } from './KitV3';
import { StickyCta } from './StickyCta';
import { VideoJornada } from './VideoJornada';
import '@/app/v2/v2.css';
import '@/app/v3/v3.css';

/**
 * LP V.3 "Capa Zero": cada seção responde a próxima dúvida de quem lê.
 * Herda o visual da V.2 (`.v2`) e só acrescenta o que é dela (`.v3`).
 *
 * Junta o melhor das duas anteriores: da V.1, o selo de alunos, a progressão
 * semana a semana e os responsáveis técnicos à vista; da V.2, o app passando
 * sobre a foto do Igor, o kit saindo do card de compra e o vídeo da jornada.
 *
 * Medição idêntica à da home: ViewContentWatcher e CtaButton, com `origem`
 * própria em cada botão (v3-hero, v3-oferta, v3-fechamento, v3-sticky).
 */
export async function LpV3() {
  const slug = produtoPorId(ID_FRONT)?.oferta;
  const parcelamento = (slug ? await parcelamentoDaOferta(slug) : null) ?? ofertaV2.card.reserva;
  const preco = `${parcelamento.vezes}x R$ ${reais(parcelamento.parcelaCentavos)} ou R$ ${reais(parcelamento.avistaCentavos)} à vista`;

  return (
    <div className="v2 v3">
      <ViewContentWatcher moeda={oferta.precoMoeda} />
      <Hero preco={preco} />
      <Capa />
      <Igor />
      <Metodo />
      <Faixa />
      <Prova />
      <Oferta parcelamento={parcelamento} />
      <Faq />
      <Fechamento preco={preco} />
      <RodapeV2 />
      <StickyCta parcelamento={parcelamento} texto={ctaV3} />
    </div>
  );
}

/** [1] O que é: mecanismo na headline, preço e botão já na primeira tela. */
function Hero({ preco }: { preco: string }) {
  const h = heroV3;
  return (
    <section className="v3-hero">
      <div className="v3-hero__foto">
        <Image src={h.foto.src} alt={h.foto.alt} width={h.foto.width} height={h.foto.height} sizes="(max-width: 900px) 100vw, 50vw" priority />
        <Image className="v3-hero__logo" src="/img/logo-desafio.svg" alt="Desafio Abdômen Insano" width={140} height={79} />
        <CelularApp telas={telasApp.vitrine} rotulo="O app do desafio: treino, séries e dieta" pontos={false} className="v3-hero__celular" />
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
        <p className="v3-etiqueta">{h.etiqueta}</p>
        <h1 className="v3-hero__titulo">
          {h.titulo} <span className="v2-acento">{h.tituloDestaque}</span>
        </h1>
        <p className="v3-hero__sub">
          <Rico texto={h.sub} />
        </p>
        <div data-v3="topo">
          <CtaButton className="v2-cta" origem="v3-hero">
            {ctaV3}
          </CtaButton>
        </div>
        <p className="v3-hero__preco">{preco}</p>
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
    <section className="v2-sec v3-sec--capa">
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

/** [3] Quem está por trás: a única pausa clara da página. */
function Igor() {
  const i = igorV3;
  return (
    <section className="v2-sec v2-sec--claro">
      <div className="v2-col v3-igor">
        <div>
          <p className="v3-etiqueta">{i.etiqueta}</p>
          <h2 className="v2-h2">
            <Rico texto={i.titulo} />
          </h2>
          <div className="v3-igor__fotos">
            {[i.antes, i.depois].map((l) => (
              <figure key={l.legenda}>
                <Image src={l.foto.src} alt={l.foto.alt} width={l.foto.width} height={l.foto.height} sizes="(max-width: 720px) 40vw, 200px" />
                <figcaption>{l.legenda}</figcaption>
              </figure>
            ))}
          </div>
        </div>
        <div>
          {i.texto.map((p) => (
            <p key={p}>
              <Rico texto={p} />
            </p>
          ))}
          <p className="v3-numero">
            <b>{i.numero.valor}</b>
            <span>{i.numero.legenda}</span>
          </p>
        </div>
      </div>
    </section>
  );
}

/** [4] Como funciona: três engrenagens e os três passos de entrada, com o app de verdade. */
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

        <div className="v3-semanas">
          <h3 className="v3-semanas__titulo">{m.semanasTitulo}</h3>
          <ol>
            {m.semanas.map((s) => (
              <li key={s.rotulo}>
                <span>{s.rotulo.replace('Semana ', '')}</span>
                {s.titulo}
              </li>
            ))}
          </ol>
          <p className="v3-responsaveis">
            <Rico texto={m.responsaveis} />
          </p>
        </div>

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

/** [5] A faixa laranja que corre: energia entre o método e os casos. Decorativa. */
function Faixa() {
  // Duas cópias seguidas: a animação anda metade da largura e recomeça sem emenda.
  const itens = [...faixaV3, ...faixaV3];
  return (
    <div className="v3-faixa" aria-hidden="true">
      <div className="v3-faixa__trilho">
        {itens.map((t, n) => (
          <span key={n}>{t}</span>
        ))}
      </div>
    </div>
  );
}

/** [6] Funciona com gente como eu: os casos num trilho só. */
function Prova() {
  return (
    <section className="v2-sec v2-sec--escuro">
      <div className="v2-col v2-col--largo">
        <h2 className="v2-h2 v2-centro">
          <Rico texto={provaV3.titulo} />
        </h2>
        <p className="v2-sub v2-centro">{provaV3.sub}</p>
        <CarrosselV3 casos={provaV3.casos} />
        <p className="v3-aviso v2-centro">{provaV3.aviso}</p>
        <div className="v3-beneficios">
          <h3>{provaV3.beneficiosTitulo}</h3>
          <ul>
            {provaV3.beneficios.map((b) => (
              <li key={b}>
                <IconeCheck />
                <span>
                  <Rico texto={b} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/** [7] A oferta, uma vez só: o que vem, a pilha de bônus com valor, o preço e a garantia colada nele. */
function Oferta({ parcelamento }: { parcelamento: Parcelamento }) {
  const o = ofertaV3;
  return (
    <section className="v2-sec v2-sec--preto v2-oferta" id="oferta">
      <div className="v2-col v3-oferta">
        <div className="v3-oferta__topo">
          <p className="v3-etiqueta">{o.etiqueta}</p>
          <h2 className="v2-h2">
            <Rico texto={o.titulo} />
          </h2>
          <p className="v2-sub">{o.sub}</p>
          <VideoJornada {...o.video} />
        </div>

        <div className="v3-card" data-v3="oferta">
          <KitV3 />
          <div className="v3-card__corpo">
            <ul className="v3-pilha">
              {o.principal.map((p) => (
                <li key={p.titulo}>
                  <IconeCheck />
                  <div>
                    <b>{p.titulo}</b>
                    <span>{p.linha}</span>
                  </div>
                </li>
              ))}
            </ul>
            <p className="v3-card__rotulo">Bônus</p>
            <ul className="v3-pilha">
              {o.bonus.map((b) => (
                <li key={b.titulo}>
                  <IconeCheck />
                  <div>
                    <b>{b.titulo}</b>
                    <span>{b.linha}</span>
                  </div>
                </li>
              ))}
            </ul>

            <div className="v3-preco">
              <p className="v3-preco__provoca">{o.preco.provocacao}</p>
              <p className="v3-preco__linha">{o.preco.linha}</p>
              <p className="v3-preco__valor">
                <span>{parcelamento.vezes}x</span> R$ {reais(parcelamento.parcelaCentavos)}
              </p>
              <p className="v3-preco__avista">ou R$ {reais(parcelamento.avistaCentavos)} à vista</p>
              {/* 42 dias: só afirma "menos de R$ 2 por dia" se o preço vivo da Cakto deixar. */}
              {parcelamento.avistaCentavos / 42 < 200 && (
                <p className="v3-preco__reforco">
                  <Rico texto={o.preco.reforco} />
                </p>
              )}
            </div>

            <CtaButton className="v2-cta" origem="v3-oferta" microcopy={o.preco.microcopy}>
              {ctaV3}
            </CtaButton>

            <div className="v3-garantia">
              <div className="v2-selo" aria-hidden="true">
                <span className="v2-selo__numero">{o.garantia.numero}</span>
                <span className="v2-selo__rotulo">{o.garantia.rotulo}</span>
              </div>
              <div>
                <h3>{o.garantia.titulo}</h3>
                <p>{o.garantia.texto}</p>
                <a className="v2-link" href={`mailto:${o.garantia.email}`}>
                  {o.garantia.email}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** [8] As dúvidas que sobram, com o suporte rebaixado a link. */
function Faq() {
  return (
    <section className="v2-sec v2-sec--fim">
      <div className="v2-col">
        <h2 className="v2-h2 v2-centro">{faqV3.titulo}</h2>
        <div className="v2-faq">
          {faqV3.itens.map((f, n) => (
            <FaqItem key={f.pergunta} numero={String(n + 1).padStart(2, '0')} pergunta={f.pergunta} resposta={f.resposta} />
          ))}
        </div>
        <p className="v3-suporte">
          Ficou alguma dúvida?{' '}
          <a href={suporte.linkUrl} target="_blank" rel="noopener noreferrer">
            Fala com a equipe
          </a>
        </p>
      </div>
    </section>
  );
}

/** [9] O último empurrão: o botão de novo, depois de todas as respostas. */
function Fechamento({ preco }: { preco: string }) {
  return (
    <section className="v2-sec v3-fechamento">
      <div className="v2-col v2-centro">
        <h2 className="v2-h2">
          <Rico texto={fechamentoV3.titulo} />
        </h2>
        <p className="v2-sub">{fechamentoV3.sub}</p>
        <div data-v3="oferta">
          <CtaButton className="v2-cta" origem="v3-fechamento" microcopy={preco}>
            {ctaV3}
          </CtaButton>
        </div>
      </div>
    </section>
  );
}
