'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type MouseEvent } from 'react';
import { oferta, type BotaoFunil } from '@/content/desafio';
import { jaEstaSaindo, rastrear, seguirAposMedir } from '@/lib/pixel';
import { produtoPorId, type ProdutoId } from '@/lib/produtos';
import { usePreco } from '@/components/ui/Precos';
import { anexarParametros, lerCookiesDoPixel, lerUtm } from '@/lib/utm';

/** Script do botão de um clique da Cakto — o mesmo do código de incorporação do painel. */
const SCRIPT_CAKTO = 'https://caktoscripts.nyc3.cdn.digitaloceanspaces.com/upsell.js';
const ELEMENTO_ACEITAR = 'cakto-upsell-accept';
/** Quanto esperar o script da Cakto antes de entregar o link de checkout comum. */
const PRAZO_SCRIPT_MS = 8000;

type AtributosCakto = React.HTMLAttributes<HTMLElement> & {
  'bg-color'?: string;
  'text-color'?: string;
  'upsell-accept-url'?: string;
  'upsell-reject-url'?: string;
  'offer-id'?: string;
  'offer-type'?: string;
  'app-base-url'?: string;
};

declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'cakto-upsell-buttons': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'cakto-upsell-accept': React.DetailedHTMLProps<AtributosCakto, HTMLElement>;
      'cakto-upsell-reject': React.DetailedHTMLProps<AtributosCakto, HTMLElement>;
    }
  }
}

type Props = {
  aceitar: BotaoFunil;
  /** Degrau que esta página vende — define o produto e o valor do evento. */
  produtoId: ProdutoId;
  recusarTexto: string;
  /** Pra onde vai quem aceita — vem da ordem do funil (`lib/funil.ts`). */
  aceiteHref: string;
  /** Próxima parada de quem recusa — vem da ordem do funil (`lib/funil.ts`). */
  recusarHref: string;
  /** Esconde até a VTurb liberar (delay do pitch). */
  esconder: boolean;
};

/**
 * Tudo que acompanha a pessoa pelo funil: UTMs guardadas na LP, cookies do
 * pixel (é o que deixa a Conversions API casar a venda do upsell com quem
 * clicou no anúncio) e a query da própria página (a Cakto manda email e
 * transação por ali, e o /obrigado precisa deles no fim do funil). Sem isso a
 * venda do upsell perde a origem.
 */
function parametrosDaSessao(): Record<string, string> {
  const extras: Record<string, string> = { ...lerUtm(), ...lerCookiesDoPixel() };
  new URLSearchParams(window.location.search).forEach((v, k) => {
    extras[k] = v;
  });
  return extras;
}

function repassarParametros(evento: MouseEvent<HTMLAnchorElement>) {
  evento.currentTarget.href = anexarParametros(evento.currentTarget.href, parametrosDaSessao());
}

/** `origin + search` no navegador; `null` no servidor (que não tem nem um nem outro). */
const semAssinatura = () => () => {};
function useEnderecoDaPagina(): string | null {
  return useSyncExternalStore(
    semAssinatura,
    () => window.location.origin + window.location.search,
    () => null,
  );
}

/**
 * Par "sim / não" da oferta pós-compra.
 *
 * Com `aceitar.cakto`, o "sim" é o botão de um clique da Cakto (cobra no cartão
 * que acabou de pagar o Desafio) e o "não" é o da Cakto também — é ele que leva
 * o token do upsell adiante, pro downsell cobrar do mesmo jeito. Os dois levam
 * pra próxima página já com e-mail, transação e UTM: o redirecionamento da
 * Cakto só acrescenta o token, e o /obrigado precisa do resto.
 *
 * Sem `cakto`, ou com o script da Cakto bloqueado ou fora do ar, a página cai
 * no link de checkout comum. Quem não consegue o um clique ainda consegue
 * comprar. O "sim" só existe com link; o "não" sempre existe — a página nunca
 * vira beco sem saída pra quem já pagou.
 */
export function BotoesFunil({ aceitar, produtoId, recusarTexto, aceiteHref, recusarHref, esconder }: Props) {
  const preco = usePreco(produtoId);
  const casca = useRef<HTMLDivElement>(null);
  const [scriptFalhou, setScriptFalhou] = useState(false);
  const endereco = useEnderecoDaPagina();

  // Endereços absolutos, já com a query da sessão. Só no navegador: o servidor
  // não sabe a origem nem a query, e o script da Cakto lê estes atributos
  // quando define os elementos — então eles precisam estar prontos antes de
  // o script ser carregado.
  const destinos = useMemo(() => {
    if (endereco === null) return null;
    const origem = new URL(endereco).origin;
    const extras = parametrosDaSessao();
    return {
      aceite: anexarParametros(`${origem}${aceiteHref}`, extras),
      recusa: anexarParametros(`${origem}${recusarHref}`, extras),
    };
  }, [endereco, aceiteHref, recusarHref]);

  const querCakto = Boolean(aceitar.cakto && destinos);
  const modoCakto = querCakto && !scriptFalhou;

  useEffect(() => {
    if (!querCakto || customElements.get(ELEMENTO_ACEITAR)) return;

    let script = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_CAKTO}"]`);
    if (!script) {
      script = document.createElement('script');
      script.src = SCRIPT_CAKTO;
      script.async = true;
      document.head.appendChild(script);
    }
    const falhar = () => setScriptFalhou(true);
    script.addEventListener('error', falhar);
    const prazo = window.setTimeout(() => {
      if (!customElements.get(ELEMENTO_ACEITAR)) falhar();
    }, PRAZO_SCRIPT_MS);
    return () => {
      script.removeEventListener('error', falhar);
      window.clearTimeout(prazo);
    };
  }, [querCakto]);

  /**
   * O "sim" é um checkout começando, igual ao CTA da LP — e o Meta precisa
   * saber de qual degrau, senão o upsell vira número do front.
   */
  const medirInicioDeCompra = useCallback(() => {
    const produto = produtoPorId(produtoId);
    if (!produto) return;
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
  }, [produtoId, preco]);

  // O botão da Cakto vive em shadow DOM, mas o clique atravessa até o elemento.
  useEffect(() => {
    if (!modoCakto) return;
    const botao = casca.current?.querySelector(ELEMENTO_ACEITAR);
    botao?.addEventListener('click', medirInicioDeCompra);
    return () => botao?.removeEventListener('click', medirInicioDeCompra);
  }, [modoCakto, medirInicioDeCompra]);

  function aceitarPeloLink(evento: MouseEvent<HTMLAnchorElement>) {
    if (jaEstaSaindo(evento)) return;
    // Primeiro o que a venda precisa, depois o que a medição precisa: se o
    // pixel explodir (extensão de privacidade, cookie barrado), o link já
    // saiu com UTM, email e id de transação. Medir é acessório; o parâmetro
    // do checkout não é.
    repassarParametros(evento);
    medirInicioDeCompra();
    seguirAposMedir(evento);
  }

  // A VTurb revela o elemento com `display: block` — por isso o `.esconder`
  // fica numa casca por fora e o flex do layout mora no filho.
  return (
    <div ref={casca} className={esconder ? 'esconder' : undefined}>
      {modoCakto && aceitar.cakto && destinos ? (
        <div className="funil__acoes">
          <cakto-upsell-buttons>
            <cakto-upsell-accept
              bg-color="#ff6b00"
              text-color="#0c0b0a"
              upsell-accept-url={destinos.aceite}
              offer-id={aceitar.cakto.id}
              app-base-url="https://app.cakto.com.br"
              offer-type={aceitar.cakto.tipo}
              upsell-reject-url={destinos.recusa}
              data-origem="funil-aceitar"
            >
              {aceitar.texto}
            </cakto-upsell-accept>
            <cakto-upsell-reject upsell-reject-url={destinos.recusa} data-origem="funil-recusar">
              {recusarTexto}
            </cakto-upsell-reject>
          </cakto-upsell-buttons>
        </div>
      ) : (
        <div className="funil__acoes">
          {aceitar.url && (
            <a className="cta funil__cta" href={aceitar.url} onClick={aceitarPeloLink} data-origem="funil-aceitar">
              {aceitar.texto}
            </a>
          )}
          <a className="funil__recusar" href={recusarHref} onClick={repassarParametros} data-origem="funil-recusar">
            {recusarTexto}
          </a>
        </div>
      )}
    </div>
  );
}
