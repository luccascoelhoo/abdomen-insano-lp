'use client';

import { textosCapa } from '@/content/quiz';
import { cupomDaPessoa, descontoPercentual } from '@/lib/desconto';
import type { Parcelamento } from '@/lib/parcelamento';
import { nivelDaCapa, primeiroNome } from '../calculos';
import { BlocoPreco } from './BlocoPreco';
import { useDadosOferta } from './contexto';
import { IconeCheckRedondo, IconeEnvelope } from './icones';
import { bonusDoPlano, itensDoPlano, type ItemPlano } from './itens';

function Linha({ item, bonus = false }: { item: ItemPlano; bonus?: boolean }) {
  return (
    <li className={`qo-item${bonus ? ' qo-item--bonus' : ''}`}>
      <span className="qo-item__check" aria-hidden="true">
        <IconeCheckRedondo />
      </span>
      <span className="qo-item__texto">
        <span className="qo-item__titulo">{item.titulo}</span>
        {item.detalhe && <span className="qo-item__detalhe">{item.detalhe}</span>}
      </span>
      {bonus && <span className="qo-item__tag">Grátis</span>}
    </li>
  );
}

/**
 * Topo premium da oferta: selo do desconto, título com o nome, o lembrete do
 * e-mail, "O que você recebe" (ajustado às respostas) e o bloco de preço.
 * Cliente porque lê as respostas pelo contexto aberto em `TelaOferta`; o
 * parcelamento vivo da Cakto chega por props do servidor.
 */
export function CartaoPremium({ parcelamento }: { parcelamento: Parcelamento }) {
  const { respostas: r, irPara } = useDadosOferta();
  const pct = descontoPercentual(parcelamento.avistaCentavos);
  const nome = primeiroNome(r);
  const capa = textosCapa.niveis[nivelDaCapa(r)].rotulo.toLowerCase();
  const email = typeof r.email === 'string' ? r.email.trim() : '';

  return (
    <section className="qo" aria-labelledby="qo-titulo">
      <div className="qo-col">
        {pct > 0 && (
          <p className="qo-banner">
            <IconeCheckRedondo className="qo-banner__icone" />
            <span>
              Desconto de {pct}% aplicado
              <span className="qo-banner__cupom"> · cupom {cupomDaPessoa(nome, pct)}</span>
            </span>
          </p>
        )}

        <h1 id="qo-titulo" className="v2-h2 qo-titulo">
          {nome ? `${nome}, o seu ` : 'O seu '}
          <span className="v2-acento">Plano Capa Zero</span> de 42 dias está pronto
        </h1>
        <p className="qo-sub">Calibrado para a sua capa {capa} e a sua rotina</p>

        {email && (
          <div className="qo-email" role="note">
            <IconeEnvelope className="qo-email__icone" />
            <div className="qo-email__corpo">
              <p className="qo-email__linha">
                Na compra, use o e-mail <b className="qo-email__endereco">{email}</b>
              </p>
              <p className="qo-email__porque">É com ele que você entra no app, e o seu plano já chega montado lá dentro.</p>
              {irPara && (
                <button type="button" className="qo-email__corrigir" onClick={() => irPara('email')}>
                  Digitou errado? Corrigir o e-mail
                </button>
              )}
            </div>
          </div>
        )}

        <div className="qo-stack">
          <h2 className="qo-stack__titulo">O que você recebe</h2>
          <ul className="qo-lista">
            {itensDoPlano(r).map((i) => (
              <Linha key={i.titulo} item={i} />
            ))}
          </ul>
          <p className="qo-stack__sub">Bônus incluídos</p>
          <ul className="qo-lista qo-lista--bonus">
            {bonusDoPlano(r).map((i) => (
              <Linha key={i.titulo} item={i} bonus />
            ))}
          </ul>
        </div>

        <BlocoPreco parcelamento={parcelamento} origem="quiz-oferta" />
      </div>
    </section>
  );
}
