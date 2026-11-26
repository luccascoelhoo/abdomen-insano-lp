import type { Dispositivo, FiltroPlayer, OpcoesPlayer, TestePlayer } from './tipos';

/**
 * Decisões que o Player Insano toma antes de montar o vídeo:
 *  - qual variante do teste A/B esta pessoa vê;
 *  - se ela passa no filtro de tráfego.
 * Rodam só no navegador (sorteio, idioma, tela, URL), depois da hidratação.
 */

const RE_ID = /^[a-z0-9_-]{1,32}$/;

function ler(chave: string): string | null {
  try {
    return localStorage.getItem(chave);
  } catch {
    return null;
  }
}

function gravar(chave: string, valor: string) {
  try {
    localStorage.setItem(chave, valor);
  } catch {}
}

/** Celular, tablet ou desktop, pelo tipo de ponteiro e pelo tamanho da tela. */
export function dispositivo(): Dispositivo {
  if (typeof window === 'undefined') return 'desktop';
  const toque = window.matchMedia?.('(pointer: coarse)').matches ?? false;
  if (!toque) return 'desktop';
  const menor = Math.min(window.screen.width, window.screen.height);
  return menor >= 600 ? 'tablet' : 'celular';
}

/* ---------------------------------------------------------------- teste A/B */

export interface VarianteEscolhida {
  /** `teste:variante`, como vai nas métricas. */
  rotulo: string;
  opcoes?: OpcoesPlayer;
}

/**
 * Sorteia (por peso) uma vez e lembra no navegador: a mesma pessoa vê sempre a
 * mesma variante. Ids fora do formato são ignorados (não chegariam às métricas).
 */
export function escolherVariante(teste: TestePlayer): VarianteEscolhida | null {
  if (!RE_ID.test(teste.id)) return null;
  const validas = teste.variantes.filter((v) => RE_ID.test(v.id));
  if (!validas.length) return null;
  const achar = (id: string | null) => validas.find((v) => v.id === id);

  let v = (teste.vencedora && achar(teste.vencedora)) || achar(ler(`pi_ab_${teste.id}`));
  if (!v) {
    const total = validas.reduce((s, x) => s + Math.max(0, x.peso ?? 1), 0);
    let sorteio = Math.random() * (total || validas.length);
    v = validas[validas.length - 1];
    for (const x of validas) {
      sorteio -= total ? Math.max(0, x.peso ?? 1) : 1;
      if (sorteio < 0) {
        v = x;
        break;
      }
    }
    gravar(`pi_ab_${teste.id}`, v.id);
  }
  return { rotulo: `${teste.id}:${v.id}`, opcoes: v.opcoes };
}

/* ---------------------------------------------------------- filtro de tráfego */

let paisEmCache: Promise<string | null> | null = null;

/** País da visita, do cabeçalho da Vercel (`GET /api/player`). `null` se não souber. */
function paisDaVisita(): Promise<string | null> {
  paisEmCache ??= fetch('/api/player', { cache: 'no-store' })
    .then((r): Promise<{ pais?: unknown }> | { pais?: unknown } => (r.ok ? r.json() : {}))
    .then((d) => (typeof d.pais === 'string' ? d.pais.toUpperCase() : null))
    .catch(() => null);
  return paisEmCache;
}

/**
 * `true` = passa. Na dúvida (país desconhecido, rede falhou), passa: o filtro
 * existe para tirar tráfego ruim, não para esconder a oferta de quem pagou.
 */
export async function passaNoFiltro(f: FiltroPlayer): Promise<boolean> {
  if (f.dispositivos?.length && !f.dispositivos.includes(dispositivo())) return false;

  if (f.idiomas?.length) {
    const langs = (navigator.languages?.length ? navigator.languages : [navigator.language]).map((l) =>
      l.toLowerCase(),
    );
    const ok = f.idiomas.some((p) => langs.some((l) => l === p.toLowerCase() || l.startsWith(`${p.toLowerCase()}-`)));
    if (!ok) return false;
  }

  if (f.chaveUrl) {
    const valor = new URLSearchParams(location.search).get(f.chaveUrl.nome);
    const chave = `pi_chave_${f.chaveUrl.nome}`;
    // Quem chegou com a chave uma vez continua passando ao recarregar sem ela.
    if (valor === f.chaveUrl.valor) gravar(chave, valor);
    else if (ler(chave) !== f.chaveUrl.valor) return false;
  }

  if (f.paises?.length) {
    const pais = await paisDaVisita();
    if (pais && !f.paises.map((p) => p.toUpperCase()).includes(pais)) return false;
  }

  return true;
}

/** Junta as opções da página com as da variante (a variante ganha). */
export function juntarOpcoes(base?: OpcoesPlayer, extra?: OpcoesPlayer): OpcoesPlayer | undefined {
  if (!extra) return base;
  return { ...base, ...extra };
}
