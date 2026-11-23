'use client';

import { useEffect, useState } from 'react';
import { usePrecoCentavos } from '@/components/ui/Precos';
import { ID_FRONT } from '@/lib/produtos';
import { PRECO_REFERENCIA_CENTAVOS, brl, cupomDaPessoa, descontoPercentual } from '@/lib/desconto';
import { primeiroNome } from '../motor';
import type { PropsTela } from '../tipos';

/**
 * Tela 'desconto': "Desconto liberado!", antes da oferta. O percentual sai dos
 * dois preços que a página de vendas já mostra (riscado × à vista); a cifra
 * sobe de 0 até o valor, e só.
 */
export function TelaDesconto({ respostas: r, avancar }: PropsTela) {
  const avista = usePrecoCentavos(ID_FRONT);
  const alvo = avista ? descontoPercentual(avista) : 0;
  const cupom = cupomDaPessoa(primeiroNome(r), alvo);
  const [valor, setValor] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!alvo) return;
    const reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let quadroUnico = 0;
    if (reduz) {
      // Sem animação: o valor final já entra no primeiro quadro.
      quadroUnico = requestAnimationFrame(() => setValor(alvo));
      return () => cancelAnimationFrame(quadroUnico);
    }
    const duracao = 1100;
    const inicio = performance.now();
    let quadro = 0;
    const passo = (agora: number) => {
      const t = Math.min(1, (agora - inicio) / duracao);
      setValor(Math.round(alvo * (1 - Math.pow(1 - t, 3))));
      if (t < 1) quadro = requestAnimationFrame(passo);
    };
    quadro = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(quadro);
  }, [alvo]);

  return (
    <div className="v2 qr">
      <section className="v2-sec v2-sec--claro qr-sec">
        <div className="qr-col qr-desconto">
          <h1 className="v2-h2 qr-titulo">Desconto liberado!</h1>
          <p className="qr-desconto__sub">Aplicado automaticamente na sua oferta</p>

          <div className="qr-desconto__cartao" role="group" aria-label={`${alvo}% de desconto`}>
            <p className="qr-desconto__numero" aria-hidden="true">
              {valor}
              <span>%</span>
            </p>
            <p className="qr-desconto__de">de desconto</p>
            <p className="qr-desconto__produto">no Desafio Abdômen Insano de 42 dias</p>
            {avista ? (
              <p className="qr-desconto__precos">
                de <s>{brl(PRECO_REFERENCIA_CENTAVOS)}</s> por <b>{brl(avista)}</b> à vista
              </p>
            ) : null}
            <div className="qr-desconto__cupom">
              <span>Código promocional</span>
              <b>{cupom}</b>
            </div>
          </div>

          <p className="qr-desconto__nota">
            O código já está aplicado: você não precisa digitar nada. Toque em continuar para ver a sua oferta.
          </p>
          <button type="button" className="qr-botao" onClick={avancar}>
            Continuar
          </button>
        </div>
      </section>
    </div>
  );
}
