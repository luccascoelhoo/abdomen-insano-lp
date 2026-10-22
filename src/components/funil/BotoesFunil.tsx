'use client';

import type { MouseEvent } from 'react';
import { oferta, type BotaoFunil } from '@/content/desafio';
import { jaEstaSaindo, rastrear, seguirAposMedir } from '@/lib/pixel';
import { produtoPorId, type ProdutoId } from '@/lib/produtos';
import { usePreco, usePrecoCentavos, useRecorrencia } from '@/components/ui/Precos';
import { condicoesDaOferta, sufixoDoBotao } from '@/lib/condicoes';
import { anexarParametros, lerCookiesDoPixel, lerUtm } from '@/lib/utm';

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
 * guardadas na LP — sem isso a venda do upsell perde a origem. Os cookies do
 * pixel vão junto pelo mesmo motivo do checkout do front: é o que deixa a
 * Conversions API casar a venda do upsell com quem clicou no anúncio.
 */
function repassarParametros(evento: MouseEvent<HTMLAnchorElement>) {
  const extras: Record<string, string> = { ...lerUtm(), ...lerCookiesDoPixel() };
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
  const preco = usePreco(produtoId);
  const centavos = usePrecoCentavos(produtoId);
  const recorrencia = useRecorrencia(produtoId);

  /*
   * Preço e periodicidade saem da Cakto, não do arquivo de conteúdo.
   * Escritos à mão eles envelhecem calados: em 22/10/2026 as duas ofertas do
   * funil cobravam em ritmos diferentes (upsell a cada 30 dias, downsell a
   * cada 365) e a mesma frase valia para as duas. Derivando daqui, quem mexe
   * no painel mexe no texto junto.
   */
  const condicoes = condicoesDaOferta(centavos, recorrencia);
  const rotulo =
    recorrencia?.tipo === 'subscription' && preco
      ? `${aceitar.texto} — R$ ${preco.toFixed(2).replace('.', ',')}${sufixoDoBotao(recorrencia.periodoDias)}`
      : aceitar.texto;
  /**
   * O "sim" é um checkout começando, igual ao CTA da LP — e o Meta precisa
   * saber de qual degrau, senão o upsell vira número do front.
   */
  function aceitarOferta(evento: MouseEvent<HTMLAnchorElement>) {
    if (jaEstaSaindo(evento)) return;
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
          value: preco ?? produto.centavos / 100,
          currency: oferta.precoMoeda,
          content_ids: [produto.id],
          content_name: produto.nome,
          content_type: 'product',
          origem: 'funil-aceitar',
        },
        produto.id,
      );
    }
    seguirAposMedir(evento);
  }

  // A VTurb revela o elemento com `display: block` — por isso o `.esconder`
  // fica numa casca por fora e o flex do layout mora no filho.
  return (
    <div className={esconder ? 'esconder' : undefined}>
      <div className="funil__acoes">
        {/* As condições vêm ANTES do botão de propósito: quem lê de cima pra
            baixo encontra o preço e a recorrência antes de poder clicar. */}
        <p className="funil__condicoes">{condicoes}</p>
        {aceitar.url && (
          <a className="cta funil__cta" href={aceitar.url} onClick={aceitarOferta} data-origem="funil-aceitar">
            {rotulo}
          </a>
        )}
        <a className="funil__recusar" href={recusarHref} onClick={repassarParametros} data-origem="funil-recusar">
          {recusarTexto}
        </a>
      </div>
    </div>
  );
}
