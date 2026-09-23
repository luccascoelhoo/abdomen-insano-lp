'use client';

import type { MouseEvent } from 'react';
import { oferta, type BotaoFunil } from '@/content/desafio';
import { rastrear } from '@/lib/pixel';
import { produtoPorId, type ProdutoId } from '@/lib/produtos';
import { anexarParametros, lerUtm } from '@/lib/utm';

type Props = {
  aceitar: BotaoFunil;
  /** Degrau que esta página vende — define o produto e o valor do evento. */
  produtoId: ProdutoId;
  recusarTexto: string;
  /** Próxima parada de quem recusa — vem da ordem do funil (`lib/funil.ts`). */
  recusarHref: string;
  /** Esconde até a VTurb liberar (delay do pitch). */
  esconder: boolean;
};

/**
 * No clique, repassa tudo que chegou na URL (a Cakto manda email e transação
 * por ali, e o /obrigado precisa deles no fim do funil) mais as UTMs
 * guardadas na LP — sem isso a venda do upsell perde a origem.
 */
function repassarParametros(evento: MouseEvent<HTMLAnchorElement>) {
  const extras: Record<string, string> = { ...lerUtm() };
  new URLSearchParams(window.location.search).forEach((v, k) => {
    extras[k] = v;
  });
  evento.currentTarget.href = anexarParametros(evento.currentTarget.href, extras);
}

/**
 * Par "sim / não" da oferta pós-compra.
 * O "sim" só existe com link de checkout; o "não" sempre existe — a página
 * nunca vira beco sem saída pra quem já pagou.
 */
export function BotoesFunil({ aceitar, produtoId, recusarTexto, recusarHref, esconder }: Props) {
  /**
   * O "sim" é um checkout começando, igual ao CTA da LP — e o Meta precisa
   * saber de qual degrau, senão o upsell vira número do front.
   */
  function aceitarOferta(evento: MouseEvent<HTMLAnchorElement>) {
    // Primeiro o que a venda precisa, depois o que a medição precisa: se o
    // pixel explodir (extensão de privacidade, cookie barrado), o link já
    // saiu com UTM, email e id de transação. Medir é acessório; o parâmetro
    // do checkout não é.
    repassarParametros(evento);

    const produto = produtoPorId(produtoId);
    if (produto) {
      rastrear(
        'InitiateCheckout',
        {
          value: produto.centavos / 100,
          currency: oferta.precoMoeda,
          content_ids: [produto.id],
          content_name: produto.nome,
          content_type: 'product',
          origem: 'funil-aceitar',
        },
        produto.id,
      );
    }
  }

  // A VTurb revela o elemento com `display: block` — por isso o `.esconder`
  // fica numa casca por fora e o flex do layout mora no filho.
  return (
    <div className={esconder ? 'esconder' : undefined}>
      <div className="funil__acoes">
        {aceitar.url && (
          <a className="cta funil__cta" href={aceitar.url} onClick={aceitarOferta} data-origem="funil-aceitar">
            {aceitar.texto}
          </a>
        )}
        <a className="funil__recusar" href={recusarHref} onClick={repassarParametros} data-origem="funil-recusar">
          {recusarTexto}
        </a>
      </div>
    </div>
  );
}
