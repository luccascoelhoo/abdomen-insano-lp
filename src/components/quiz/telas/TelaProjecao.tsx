'use client';

import Image from 'next/image';
import { Rico } from '@/components/v2/Rico';
import { AntesDepois } from '@/components/ui/AntesDepois';
import { depoimentosV2 } from '@/content/lp-v2';
import { textosCapa } from '@/content/quiz';
import { idade, imc, nivelDaCapa, nivelPelaFoto } from '../motor';
import type { PropsTela } from '../tipos';
import {
  AREA,
  IMG_ATUAL,
  IMG_OBJETIVO,
  Projecao42,
  categoriaImc,
  kg,
  rotuloDe,
  textoEvento,
} from './TelaDiagnostico';

/**
 * Tela 'projecao': os números da pessoa (IMC, capa, área, idade), a projeção de
 * 42 dias, o corpo de hoje e o objetivo, um aluno de verdade e a data do evento.
 * Era o fim do diagnóstico; ganhou tela própria para cada tela ter uma ideia só.
 */
export function TelaProjecao({ respostas: r, avancar }: PropsTela) {
  const b = imc(r);
  const capa = textosCapa.niveis[nivelDaCapa(r)];
  // A tela "capa" usou só a foto; com altura e peso o nível pode mudar.
  const capaFoto = textosCapa.niveis[nivelPelaFoto(r)];
  const ajustada = capaFoto.rotulo !== capa.rotulo;
  const anos = idade(typeof r.nascimento === 'string' ? r.nascimento : undefined);
  const area = AREA[String(r.gorduraLocal)];
  const iAtual = IMG_ATUAL[String(r.fisico)] ?? 1;
  const iObjetivo = IMG_OBJETIVO[String(r.objetivo)] ?? 1;
  const evento = textoEvento(r);
  const casoReal = depoimentosV2.casos.find((c) => c.id === depoimentosV2.destaques[0]);

  return (
    <div className="v2 qr">
      <section className="v2-sec v2-sec--claro qr-sec">
        <div className="qr-col">
          <p className="qr-olho">Os seus números</p>
          <h1 className="v2-h2 qr-titulo">Onde você está e até onde dá pra chegar</h1>

          <ul className="qr-cards">
            {b !== null && (
              <li className="qr-card">
                <span className="qr-card__rotulo">O seu IMC</span>
                <span className="qr-card__valor">{kg(b)}</span>
                <span className="qr-card__extra">{categoriaImc(b)}</span>
              </li>
            )}
            <li className="qr-card qr-card--destaque">
              <span className="qr-card__rotulo">Capa de gordura</span>
              <span className="qr-card__valor">{capa.rotulo}</span>
              {ajustada && <span className="qr-card__extra">ajustada pelo seu peso e altura</span>}
            </li>
            {area && (
              <li className="qr-card">
                <span className="qr-card__rotulo">Área que mais precisa de atenção</span>
                <span className="qr-card__valor qr-card__valor--texto">{area}</span>
              </li>
            )}
            {anos !== null && (
              <li className="qr-card">
                <span className="qr-card__rotulo">Idade</span>
                <span className="qr-card__valor">{anos}</span>
                <span className="qr-card__extra">anos</span>
              </li>
            )}
          </ul>

          <p className="qr-capa">
            <Rico texto={capa.texto} />
          </p>
          <p className="qr-nota">{textosCapa.nota}</p>

          <Projecao42 r={r} />

          <div className="qr-painel">
            <h2 className="qr-painel__titulo">Do corpo de hoje ao seu objetivo</h2>
            <div className="qr-corpos">
              <figure className="qr-corpo">
                <Image
                  src={`/img/quiz/atual-${iAtual}.webp`}
                  alt=""
                  width={420}
                  height={449}
                  sizes="(min-width: 600px) 240px, 40vw"
                />
                <figcaption>
                  <b>Hoje</b>
                  <span>{rotuloDe('fisico', r.fisico)}</span>
                </figcaption>
              </figure>
              <span className="qr-corpos__seta" aria-hidden="true">
                →
              </span>
              <figure className="qr-corpo qr-corpo--objetivo">
                <Image
                  src={`/img/quiz/objetivo-${iObjetivo}.webp`}
                  alt=""
                  width={420}
                  height={449}
                  sizes="(min-width: 600px) 240px, 40vw"
                />
                <figcaption>
                  <b>Objetivo</b>
                  <span>{rotuloDe('objetivo', r.objetivo)}</span>
                </figcaption>
              </figure>
            </div>
            <p className="qr-nota">Imagens ilustrativas. O resultado de cada pessoa depende do corpo, da constância e da rotina.</p>
          </div>

          {casoReal && (
            <div className="qr-painel qr-real">
              <h2 className="qr-painel__titulo">E esse é um aluno de verdade</h2>
              <div className="qr-real__card">
                <AntesDepois src={casoReal.src} alt={casoReal.alt} legenda={depoimentosV2.legendaDestaque} />
              </div>
            </div>
          )}

          {evento && (
            <p className="qr-evento">
              <Rico texto={evento} />
            </p>
          )}

          <button type="button" className="qr-botao" onClick={avancar}>
            Ver o meu plano
          </button>
        </div>
      </section>
    </div>
  );
}
