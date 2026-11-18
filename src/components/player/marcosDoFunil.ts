import type { MarcoPlayer } from './tipos';

/** Elementos que só aparecem no minuto do pitch (botão da oferta). */
const CLASSE_PITCH = 'esconder';

/** Elementos que esperam o fim do vídeo (o "não quero"). */
const CLASSE_FIM = 'esconder-fim';

/** Quanto o "não quero" espera depois de o vídeo chegar ao ponto da recusa. */
const RECUSA_ESPERA_MS = 4000;

function revelar(classe: string) {
  document.querySelectorAll<HTMLElement>(`.${classe}`).forEach((el) => {
    el.classList.remove(classe);
  });
}

function jaGuardado(chave: string): boolean {
  try {
    return Boolean(localStorage.getItem(chave));
  } catch {
    return false;
  }
}

/**
 * Os marcos que o funil usava com a VTurb (ver `VslPlayer.tsx`):
 *  - em `delaySegundos`, revela os `.esconder` (botão de compra);
 *  - em `recusaSegundos`, espera 4 s e revela os `.esconder-fim` ("não quero").
 * Os dois ficam lembrados no navegador: quem já passou vê os botões de novo ao
 * recarregar — e o "não quero" volta na hora, sem esperar os 4 s outra vez.
 *
 * Sem `recusaSegundos`, o `.esconder-fim` sai junto com o pitch (como fazia o
 * embed antigo): nunca deixar o comprador sem saída.
 *
 * Depende de uma ordem do PlayerInsano: ele chama `aoChegar` ANTES de gravar
 * a chave `lembrar`. Assim, chave já presente = visita anterior.
 */
export function marcosDoFunil(vsl: {
  playerId: string;
  delaySegundos: number;
  recusaSegundos?: number;
}): MarcoPlayer[] {
  const marcos: MarcoPlayer[] = [];
  const temRecusa = typeof vsl.recusaSegundos === 'number' && vsl.recusaSegundos > 0;

  marcos.push({
    segundos: Math.max(0, vsl.delaySegundos),
    lembrar: `ai_vsl_pitch_${vsl.playerId}`,
    aoChegar: () => {
      revelar(CLASSE_PITCH);
      if (!temRecusa) revelar(CLASSE_FIM);
    },
  });

  if (temRecusa) {
    const chaveFim = `ai_vsl_fim_${vsl.playerId}`;
    marcos.push({
      segundos: vsl.recusaSegundos as number,
      lembrar: chaveFim,
      aoChegar: () => {
        if (jaGuardado(chaveFim)) return revelar(CLASSE_FIM);
        window.setTimeout(() => revelar(CLASSE_FIM), RECUSA_ESPERA_MS);
      },
    });
  }

  return marcos;
}
