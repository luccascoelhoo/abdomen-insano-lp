import Image from 'next/image';
import { CelularApp } from '@/components/v2/CelularApp';
import { RodapeV2 } from '@/components/v2/FinalV2';
import { IconeCheck, IconeProibido, IconeX } from '@/components/v2/Icones';
import { Rico } from '@/components/v2/Rico';
import { CtaButton } from '@/components/ui/CtaButton';
import { FaqItem } from '@/components/ui/FaqItem';
import { ViewContentWatcher } from '@/components/ui/ViewContentWatcher';
import { oferta, suporte } from '@/content/desafio';
import {
  beneficiosV3,
  bonusV3,
  ctaV3,
  expertV3,
  faixaV3,
  faqV3,
  fechamentoV3,
  funcaoV3,
  garantiaV3,
  heroV3,
  ofertaV3,
  passosV3,
  problemaV3,
  provaV3,
  solucaoV3,
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
 * LP V.3: o texto do Igor (V.2) inteiro, com o desenho da V.3 por cima.
 *
 * Os blocos de texto dele usam as classes da V.2 (`.v2-*`), que já têm a cara
 * que ele aprovou. O que é da V.3 tem classe `.v3-*`: capa animada, kit no
 * card, semanas, responsáveis técnicos, faixa, carrossel com contador, botão
 * único e barra fixa.
 *
 * Medição idêntica à da home: ViewContentWatcher e CtaButton, com `origem`
 * própria em cada botão (v3-hero, v3-oferta, v3-garantia, v3-fechamento,
 * v3-sticky).
 */
export async function LpV3() {
  const slug = produtoPorId(ID_FRONT)?.oferta;
  const parcelamento = (slug ? await parcelamentoDaOferta(slug) : null) ?? ofertaV3.card.reserva;
  const preco = `${parcelamento.vezes}x R$ ${reais(parcelamento.parcelaCentavos)} ou R$ ${reais(parcelamento.avistaCentavos)} à vista`;

  return (
    <div className="v2 v3">
      <ViewContentWatcher moeda={oferta.precoMoeda} />
      <Hero preco={preco} />
      <Problema />
      <Funcao />
      <Solucao />
      <Faixa />
      <Prova />
      <Passos />
      <BeneficiosBonus />
      <Oferta parcelamento={parcelamento} />
      <Garantia />
      <Expert />
      <Faq />
      <Fechamento preco={preco} />
      <RodapeV2 />
      <StickyCta parcelamento={parcelamento} texto={ctaV3} />
    </div>
  );
}

/** [1] Topo: o banner, o selo de alunos, a headline e a lead do Igor, o botão e o preço. */
function Hero({ preco }: { preco: string }) {
  const h = heroV3;
  return (
    <section className="v3-hero">
      <div className="v3-hero__foto">
        <Image src={h.foto.src} alt={h.foto.alt} width={h.foto.width} height={h.foto.height} sizes="(max-width: 900px) 100vw, 50vw" priority />
        <Image className="v3-hero__logo" src="/img/logo-desafio.svg" alt="Desafio Abdômen Insano" width={140} height={79} />
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
        <h1 className="v3-hero__titulo">
          <span className="v2-acento">{h.tituloDestaque}</span> {h.tituloResto}
        </h1>
        <p className="v3-hero__sub">
          <Rico texto={h.sub} />
        </p>
        <p className="v3-hero__provoca">{h.provocacao}</p>
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

/** [2] O problema, no texto do Igor, com a capa desenhada secando sobre os gomos. */
function Problema() {
  const p = problemaV3;
  return (
    <section className="v2-sec v2-sec--claro">
      <div className="v2-col">
        <h2 className="v2-h2 v2-centro">
          {p.tituloAntes}
          <br />
          <span className="v2-acento">
            <Rico texto={p.tituloDestaque} />
          </span>
        </h2>
        <div className="v2-texto">
          {p.paragrafos.map((t) => (
            <p key={t}>
              <Rico texto={t} />
            </p>
          ))}
        </div>
        <p className="v2-capa">
          <Rico texto={p.capa} />
        </p>
        <CapaDesenho com={p.desenho.com} sem={p.desenho.sem} />
        <div className="v2-texto">
          <p>{p.explicacao}</p>
        </div>
        <p className="v2-punch">{p.punch}</p>
        <p className="v2-tempo">
          {p.tempo[0]}
          <br />
          <b>{p.tempo[1]}</b>
        </p>
        <p className="v2-lead">{p.consequenciasLead}</p>
        <ul className="v2-caixas">
          {p.consequencias.map((c) => (
            <li key={c} className="v2-caixa">
              <Rico texto={c} />
            </li>
          ))}
        </ul>
        <p className="v2-faixa">
          <span>{p.faixa}</span>
        </p>
      </div>
    </section>
  );
}

/** [3] As duas frentes, a tabela e as perguntas ao Igor. */
function Funcao() {
  const f = funcaoV3;
  return (
    <section className="v2-sec v2-sec--escuro">
      <div className="v2-col">
        <h2 className="v2-h2">
          {f.titulo}
          <span className="v2-h2__linha2">
            <Rico texto={f.subtitulo} />
          </span>
        </h2>
        <div className="v2-frentes">
          {f.frentes.map((fr) => (
            <article key={fr.titulo} className="v2-frente">
              <span className="v2-frente__num">{fr.numero}</span>
              <h3 className="v2-h3">{fr.titulo}</h3>
              <p>
                <Rico texto={fr.texto} />
              </p>
            </article>
          ))}
        </div>
        <h3 className="v2-h3 v2-tabela-titulo">{f.tabelaTitulo}</h3>
        <table className="v2-tabela">
          <thead>
            <tr>
              {f.tabelaColunas.map((c) => (
                <th key={c} scope="col">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {f.tabela.map((l) => (
              <tr key={l.fez} className={l.funciona ? 'v2-tabela__ok' : undefined}>
                <th scope="row">
                  {l.funciona ? <IconeCheck /> : <IconeX />}
                  {l.fez}
                </th>
                <td>{l.acontece}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="v2-qa">
          {f.perguntas.map((q) => (
            <div key={q.pergunta} className="v2-qa__item">
              <p className="v2-qa__pergunta">“{q.pergunta}”</p>
              {q.respostas.map((r) => (
                <p key={r}>
                  <Rico texto={r} />
                </p>
              ))}
            </div>
          ))}
        </div>
        <p className="v2-fecho">
          <Rico texto={f.fecho} />
        </p>
      </div>
    </section>
  );
}

/** [4] O método: as três engrenagens do Igor, a progressão semana a semana e os responsáveis. */
function Solucao() {
  const s = solucaoV3;
  return (
    <section className="v2-sec v2-sec--preto">
      <div className="v2-col v2-col--largo">
        <h2 className="v2-h2 v2-centro">
          {s.tituloAntes}{' '}
          <span className="v2-acento">
            <Rico texto={s.tituloDestaque} />
          </span>{' '}
          {s.tituloDepois}
        </h2>
        <p className="v2-sub v2-centro">
          <Rico texto={s.sub} />
        </p>
        <ol className="v3-engrenagens">
          {s.engrenagens.map((e, n) => (
            <li key={e.titulo}>
              <div className="v3-engrenagens__foto">
                <Image src={e.imagem.src} alt={e.imagem.alt} fill sizes="(max-width: 720px) 30vw, 300px" />
              </div>
              <div>
                <p className="v3-engrenagens__titulo">
                  <span>{String(n + 1).padStart(2, '0')}</span> {e.titulo}
                </p>
                <p>
                  <Rico texto={e.texto} />
                </p>
              </div>
            </li>
          ))}
        </ol>
        <div className="v3-semanas">
          <h3 className="v3-semanas__titulo">{s.semanasTitulo}</h3>
          <ol>
            {s.semanas.map((w) => (
              <li key={w.rotulo}>
                <span>{w.rotulo.replace('Semana ', '')}</span>
                {w.titulo}
              </li>
            ))}
          </ol>
          <p className="v3-responsaveis">
            <Rico texto={s.responsaveis} />
          </p>
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

/** [6] Os casos dos alunos, num trilho com contador. */
function Prova() {
  const p = provaV3;
  return (
    <section className="v2-sec v2-sec--escuro">
      <div className="v2-col v2-col--largo">
        <h2 className="v2-h2 v2-centro">
          {p.titulo}{' '}
          <span className="v2-acento">
            <Rico texto={p.tituloDestaque} />
          </span>
        </h2>
        <p className="v2-sub v2-centro">{p.sub}</p>
        <CarrosselV3 casos={p.casos} />
        <p className="v3-aviso v2-centro">{p.aviso}</p>
      </div>
    </section>
  );
}

/** [7] O passo a passo do Igor, com as telas reais do app em cada etapa. */
function Passos() {
  const e = passosV3;
  return (
    <section className="v2-sec v2-sec--preto">
      <div className="v2-col v2-col--largo">
        <h2 className="v2-h2 v2-centro">
          {e.titulo} <span className="v2-acento">{e.tituloDestaque}</span>
        </h2>
        <p className="v2-sub v2-centro">
          <Rico texto={e.sub} />
        </p>
        <ol className="v2-timeline">
          {e.passos.map((p, i) => (
            <li key={p.titulo} className={`v2-passo ${i % 2 === 0 ? 'v2-passo--dir' : 'v2-passo--esq'}`}>
              <span className="v2-passo__fundo" aria-hidden="true">
                {p.fundo}
              </span>
              <span className="v2-passo__ponto" aria-hidden="true" />
              <div className="v2-passo__card">
                <h3 className="v2-h3">
                  <span className="v2-acento">{i + 1}.</span> {p.titulo}
                </h3>
                <p>{p.texto}</p>
                {'telas' in p && p.telas && (
                  <div className="v2-passo__img">
                    <CelularApp telas={p.telas} rotulo={`Telas do app: ${p.titulo.toLowerCase()}`} />
                  </div>
                )}
                {'imagem' in p && p.imagem && (
                  <div className="v2-passo__img">
                    <Image src={p.imagem.src} alt={p.imagem.alt} width={p.imagem.width} height={p.imagem.height} sizes="(max-width: 900px) 70vw, 300px" />
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** [8] O que muda depois dos 42 dias e os bônus, no texto do Igor. */
function BeneficiosBonus() {
  const b = beneficiosV3;
  return (
    <section className="v2-sec v2-sec--branco">
      <div className="v2-col">
        <VideoJornada {...b.video} />
        <h2 className="v2-h2 v3-espaco-video">
          {b.titulo}{' '}
          <span className="v2-acento">
            <Rico texto={b.tituloDestaque} />
          </span>
        </h2>
        <ul className="v2-checks">
          {b.itens.map((t) => (
            <li key={t}>
              <IconeCheck />
              <span>
                <Rico texto={t} />
              </span>
            </li>
          ))}
        </ul>

        <div className="v2-bonus-topo">
          <h2 className="v2-h2 v2-acento">{bonusV3.titulo}</h2>
          <p className="v2-bonus-topo__sub">{bonusV3.sub}</p>
        </div>
        <div className="v2-bonus-grade">
          {bonusV3.itens.map((x) => (
            <article key={x.titulo} className="v2-bonus">
              <span className="v2-bonus__rotulo">{x.rotulo}</span>
              <h3 className="v2-h3">
                {x.titulo}
                {x.valor && <span className="v2-bonus__valor"> ({x.valor})</span>}
              </h3>
              <p>{x.texto}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/** [9] A oferta: a narrativa do Igor e o card de compra com o kit saindo por cima. */
function Oferta({ parcelamento }: { parcelamento: Parcelamento }) {
  const n = ofertaV3.narrativa;
  const c = ofertaV3.card;
  return (
    <section className="v2-sec v2-sec--preto v2-oferta" id="oferta">
      <div className="v2-col v2-centro">
        <p className="v2-oferta__pergunta">
          <Rico texto={n.pergunta} />
        </p>
        <h2 className="v2-h2">
          <Rico texto={n.promessa} />
        </h2>
        <p className="v2-oferta__chamada">{n.chamada}</p>
        <p>
          <Rico texto={n.reforco} />
        </p>
        <p>{n.fecho}</p>
        <p className="v2-oferta__lema">{n.lema}</p>

        <div className="v3-card" data-v3="oferta">
          <KitV3 />
          <div className="v3-card__corpo">
            <p className="v3-card__rotulo">{c.recebeTitulo}</p>
            <ul className="v3-lista">
              {c.recebe.map((i) => (
                <li key={i}>
                  <IconeCheck />
                  {i}
                </li>
              ))}
            </ul>
            <p className="v3-card__rotulo">{c.bonusTitulo}</p>
            <ul className="v3-lista">
              {c.bonus.map((i) => (
                <li key={i}>
                  <IconeCheck />
                  {i}
                </li>
              ))}
            </ul>
            <div className="v3-preco">
              {/* R$ 299 é o preço de referência informado pelo Igor em 29/10/2026. */}
              <p className="v3-preco__linha">
                Tudo isso, de <s>{c.precoDe}</s> por apenas…
              </p>
              <p className="v3-preco__valor">
                <span>{parcelamento.vezes}x</span> R$ {reais(parcelamento.parcelaCentavos)}
              </p>
              <p className="v3-preco__avista">ou R$ {reais(parcelamento.avistaCentavos)} à vista</p>
            </div>
            <p className="v3-preco__provoca">{c.provocacao}</p>
            <CtaButton className="v2-cta" origem="v3-oferta" microcopy="Pagamento único · 15 dias de garantia">
              {ctaV3}
            </CtaButton>
          </div>
        </div>
      </div>
    </section>
  );
}

/** [10] A garantia de 15 dias, no texto inteiro do Igor, com o botão que ele pede. */
function Garantia() {
  const g = garantiaV3;
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
        <div data-v3="oferta">
          <CtaButton className="v2-cta" origem="v3-garantia">
            {ctaV3}
          </CtaButton>
        </div>
        <p className="v2-oferta__lema v2-centro">{g.lema}</p>
      </div>
    </section>
  );
}

/** [11] O idealizador: de um lado, do outro, e a história inteira. */
function Expert() {
  const e = expertV3;
  return (
    <section className="v2-sec v2-sec--preto">
      <div className="v2-col">
        <h2 className="v2-h2 v2-centro">
          {e.titulo} <span className="v2-acento">{e.tituloDestaque}</span>
        </h2>
        <div className="v2-lados">
          {[e.antes, e.depois].map((lado, i) => (
            <div key={lado.rotulo} className="v2-lado">
              <div className="v2-lado__foto">
                <Image src={lado.foto.src} alt={lado.foto.alt} width={lado.foto.width} height={lado.foto.height} sizes="(max-width: 720px) 45vw, 320px" />
              </div>
              <p className="v2-lado__rotulo">{lado.rotulo}</p>
              <ul className={`v2-lado__itens ${i === 0 ? 'v2-lado__itens--antes' : 'v2-lado__itens--depois'}`}>
                {lado.itens.map((item) => (
                  <li key={item}>
                    {i === 0 ? <IconeProibido /> : <IconeCheck />}
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="v2-texto v2-texto--escuro">
          {e.bio.map((p) => (
            <p key={p}>
              <Rico texto={p} />
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

/** [12] As perguntas do Igor, com o suporte rebaixado a link. */
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

/** [13] O último empurrão: a provocação do Igor e o botão de novo. */
function Fechamento({ preco }: { preco: string }) {
  return (
    <section className="v2-sec v3-fechamento">
      <div className="v2-col v2-centro">
        <h2 className="v2-h2 v3-fechamento__titulo">{fechamentoV3.provocacao}</h2>
        <div data-v3="oferta">
          <CtaButton className="v2-cta" origem="v3-fechamento" microcopy={preco}>
            {ctaV3}
          </CtaButton>
        </div>
        <p className="v2-oferta__lema">{fechamentoV3.lema}</p>
      </div>
    </section>
  );
}
