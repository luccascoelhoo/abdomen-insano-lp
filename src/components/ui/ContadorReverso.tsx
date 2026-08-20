'use client';

import { useEffect, useRef } from 'react';

type Props = {
  /** Valor de partida — de onde o número desce. Deve ser maior que `ate`. */
  de: number;
  /** Valor final — onde o contador para. */
  ate: number;
  prefixo?: string;
  duracao?: number;
  /**
   * Marcos opcionais no caminho (ordem decrescente). Se informado, o número
   * "assenta" brevemente em cada valor antes de continuar caindo — dá sensação
   * de comparação com preços de referência (ex: 497 → 300 → 150 → 42).
   */
  marcos?: number[];
};

/**
 * Contador que DESCE de um valor alto até o valor final.
 *
 * Nasce mostrando o valor de partida (não zero) porque a leitura correta é
 * "estava caro, ficou barato". Um contador que sobe de 0 até 42 dá o efeito
 * oposto ao pretendido — parece que o preço está aumentando.
 *
 * Anima sempre que entra no viewport; se sair e voltar, reanima. Se o script
 * não roda ou o usuário pediu `prefers-reduced-motion`, o valor final vai
 * direto ao DOM sem contagem.
 */
export function ContadorReverso({
  de,
  ate,
  prefixo = '',
  duracao = 2200,
  marcos,
}: Props) {
  const ref = useRef<HTMLBRElement>(null);

  const formatar = (n: number) => prefixo + Math.round(n).toString();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !('IntersectionObserver' in window)
    ) {
      el.textContent = formatar(ate);
      return;
    }

    // Assim que o JS assume, reescreve pro valor de partida — evita o flash
    // "42 → 497 → animação". SSR entrega 42 (valor semanticamente correto
    // pra crawler/leitor de tela); o usuário com JS entra direto no 497.
    el.textContent = formatar(de);

    let quadro = 0;
    let rede = 0;
    let jaEntrou = false;

    const finalizar = () => {
      if (quadro) cancelAnimationFrame(quadro);
      if (rede) clearTimeout(rede);
      quadro = 0;
      rede = 0;
      el.textContent = formatar(ate);
    };

    // Sequência que a animação percorre: começo → marcos → fim.
    // Se não vieram marcos, cai reto do `de` até `ate`.
    const sequencia = [de, ...(marcos ?? []), ate];

    const iniciar = () => {
      if (document.hidden) return finalizar();
      const inicio = performance.now();

      // Distância total percorrida em "unidades de preço" — usada pra dar
      // um tempo proporcional a cada trecho, senão trechos curtos ficam
      // imperceptíveis e o trecho longo domina.
      const distancias = sequencia.slice(1).map((v, i) => Math.abs(sequencia[i] - v));
      const distanciaTotal = distancias.reduce((s, d) => s + d, 0) || 1;

      const passo = (agora: number) => {
        const t = Math.min(1, (agora - inicio) / duracao);
        // Ease-out mais suave — dá a sensação de "o número freando" no fim,
        // reforçando a chegada ao 42.
        const suave = 1 - Math.pow(1 - t, 3);
        const progresso = suave * distanciaTotal;

        // Descobre em qual segmento estamos e o quanto já percorremos dele.
        let acumulado = 0;
        let valor = ate;
        for (let i = 0; i < distancias.length; i++) {
          if (progresso <= acumulado + distancias[i]) {
            const localT = distancias[i] === 0 ? 1 : (progresso - acumulado) / distancias[i];
            valor = sequencia[i] + (sequencia[i + 1] - sequencia[i]) * localT;
            break;
          }
          acumulado += distancias[i];
        }

        el.textContent = formatar(valor);
        if (t < 1) quadro = requestAnimationFrame(passo);
        else finalizar();
      };
      quadro = requestAnimationFrame(passo);
      rede = window.setTimeout(finalizar, duracao + 800);
    };

    const aoTrocarDeAba = () => {
      if (document.hidden) finalizar();
    };

    const io = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (entrada.isIntersecting) {
            jaEntrou = true;
            iniciar();
          } else if (jaEntrou) {
            if (quadro) cancelAnimationFrame(quadro);
            if (rede) clearTimeout(rede);
            quadro = 0;
            rede = 0;
            // Reseta pro valor inicial pra reanimar quando reentrar.
            el.textContent = formatar(de);
          }
        }
      },
      { threshold: [0, 0.25] },
    );
    io.observe(el);
    document.addEventListener('visibilitychange', aoTrocarDeAba);

    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', aoTrocarDeAba);
      finalizar();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [de, ate, duracao, JSON.stringify(marcos)]);

  return <b ref={ref as never}>{formatar(ate)}</b>;
}
