/**
 * Captura de UTMs.
 *
 * Executa uma vez na chegada: se a URL tem ?utm_source/utm_medium/..., grava em
 * localStorage. Se não tem, mantém a última guardada. Assim o clique no CTA,
 * feito depois de rolar a página, ainda leva a origem correta pro checkout e,
 * mais tarde, pro webhook.
 */

const CHAVES_UTM = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;
const CHAVE_STORAGE = 'ai_utm_v1';
const CHAVE_FBCLID = 'fbclid';

type MapaUtm = Partial<Record<(typeof CHAVES_UTM)[number] | 'fbclid', string>>;

export function capturarUtmDaUrl(): void {
  if (typeof window === 'undefined') return;
  try {
    const url = new URL(window.location.href);
    const capturado: MapaUtm = {};
    for (const chave of CHAVES_UTM) {
      const v = url.searchParams.get(chave);
      if (v) capturado[chave] = v;
    }
    const fbclid = url.searchParams.get(CHAVE_FBCLID);
    if (fbclid) capturado.fbclid = fbclid;

    if (Object.keys(capturado).length === 0) return;
    window.localStorage.setItem(CHAVE_STORAGE, JSON.stringify(capturado));
  } catch {
    /* localStorage bloqueado (private mode em Safari antigo) — ignora. */
  }
}

export function lerUtm(): MapaUtm {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(CHAVE_STORAGE);
    return raw ? (JSON.parse(raw) as MapaUtm) : {};
  } catch {
    return {};
  }
}

/** Anexa UTM + parâmetros extras a uma URL de checkout, preservando o que já existe. */
export function anexarParametros(base: string, extras: Record<string, string>): string {
  try {
    const url = new URL(base);
    for (const [k, v] of Object.entries(extras)) {
      if (v && !url.searchParams.has(k)) url.searchParams.set(k, v);
    }
    return url.toString();
  } catch {
    return base;
  }
}
