import { PIXEL_ID } from '@/lib/pixel';
import type { MarcoPlayer } from './tipos';

/**
 * Pixels por tempo assistido (o "Pixels" do VTurb): um evento quando a pessoa
 * chega, COM SOM, em X segundos ou X% do vídeo. Viram marcos do player, então
 * valem as mesmas regras: uma vez por visita, só com som, o fim do vídeo
 * dispara os que faltarem.
 *
 * Meta: evento PERSONALIZADO por `trackSingleCustom`, só no nosso pixel (o
 * pixel é compartilhado com outro funil; ver `lib/pixel.ts`). Nunca evento
 * padrão: não pode confundir a otimização das campanhas.
 * Google: `gtag('event', ...)` e `dataLayer.push`, se existirem na página.
 */

export interface PixelDoPlayer {
  /** Nome do evento, ex.: 'VSL_50'. Letras, números e `_`. */
  evento: string;
  segundos?: number;
  porcento?: number;
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    // Mesmo tipo da declaração em `PurchaseTracker` (o TS exige igual).
    dataLayer?: Record<string, unknown>[];
  }
}

const RE_EVENTO = /^[A-Za-z][A-Za-z0-9_]{0,39}$/;

export function dispararPixelDoVideo(evento: string, parametros: Record<string, unknown>) {
  if (typeof window === 'undefined' || !RE_EVENTO.test(evento)) return;
  try {
    window.fbq?.('trackSingleCustom', PIXEL_ID, evento, parametros);
  } catch {}
  try {
    window.gtag?.('event', evento, parametros);
  } catch {}
  try {
    window.dataLayer?.push({ event: evento, ...parametros });
  } catch {}
}

/** Marcos que disparam os pixels. Junte com os marcos do funil: `[...marcos, ...marcosDePixel(...)]`. */
export function marcosDePixel(video: string, pixels: PixelDoPlayer[]): MarcoPlayer[] {
  return pixels
    .filter((p) => RE_EVENTO.test(p.evento) && (typeof p.segundos === 'number' || typeof p.porcento === 'number'))
    .map((p) => ({
      segundos: p.segundos,
      porcento: p.segundos === undefined ? p.porcento : undefined,
      aoChegar: () =>
        dispararPixelDoVideo(p.evento, {
          video,
          ...(p.segundos !== undefined ? { segundos: p.segundos } : { porcento: p.porcento }),
        }),
    }));
}

/** Atalho: 25, 50, 75 e 100% como `VSL_25`, `VSL_50`... */
export function pixelsPorQuartil(prefixo = 'VSL'): PixelDoPlayer[] {
  return [25, 50, 75, 100].map((porcento) => ({ evento: `${prefixo}_${porcento}`, porcento }));
}
