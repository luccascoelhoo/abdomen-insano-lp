/**
 * Entrega os arquivos HLS do Player Insano guardados no R2.
 *
 * - Só GET/HEAD/OPTIONS; nada de listar o bucket.
 * - CORS só para o nosso site, localhost e os previews da Vercel do projeto.
 * - Range (o Safari pede pedaços do MP4 de reserva).
 * - Cache: playlists 60 s; segmentos, MP4 e capa 1 ano (cada versão de
 *   vídeo vai para uma pasta nova, então nada muda no mesmo endereço).
 */

interface Env {
  VIDEOS: R2Bucket;
  ORIGENS: string;
  SUFIXO_PREVIEW: string;
}

const TIPOS: Record<string, string> = {
  m3u8: 'application/vnd.apple.mpegurl',
  m4s: 'video/iso.segment',
  mp4: 'video/mp4',
  ts: 'video/mp2t',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
};

function origemPermitida(origem: string | null, env: Env): string | null {
  if (!origem) return null;
  if (env.ORIGENS.split(',').map((s) => s.trim()).includes(origem)) return origem;
  try {
    const u = new URL(origem);
    if (u.protocol === 'https:' && u.hostname.startsWith('abdomen-insano') && u.hostname.endsWith(env.SUFIXO_PREVIEW)) {
      return origem;
    }
  } catch {}
  return null;
}

function cabecalhosCors(origem: string | null): Headers {
  const h = new Headers();
  if (origem) {
    h.set('Access-Control-Allow-Origin', origem);
    h.set('Vary', 'Origin');
    h.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    h.set('Access-Control-Allow-Headers', 'Range');
    h.set('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges, ETag');
    h.set('Access-Control-Max-Age', '86400');
  }
  return h;
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const origem = origemPermitida(req.headers.get('Origin'), env);
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cabecalhosCors(origem) });
    if (req.method !== 'GET' && req.method !== 'HEAD') return new Response('Método não permitido', { status: 405 });

    const chave = decodeURIComponent(new URL(req.url).pathname.replace(/^\/+/, ''));
    // Só caminhos de arquivo simples: nada de "..", nada de pasta vazia.
    if (!chave || chave.endsWith('/') || chave.split('/').includes('..') || !/^[\w\-./]+$/.test(chave)) {
      return new Response('Não encontrado', { status: 404 });
    }
    const ext = chave.split('.').pop()?.toLowerCase() ?? '';
    if (!TIPOS[ext]) return new Response('Não encontrado', { status: 404 });

    const objeto = await env.VIDEOS.get(chave, { range: req.headers, onlyIf: req.headers });
    if (!objeto) return new Response('Não encontrado', { status: 404, headers: cabecalhosCors(origem) });

    const h = cabecalhosCors(origem);
    objeto.writeHttpMetadata(h);
    h.set('Content-Type', TIPOS[ext]);
    h.set('ETag', objeto.httpEtag);
    h.set('Accept-Ranges', 'bytes');
    h.set('Cache-Control', ext === 'm3u8' ? 'public, max-age=60' : 'public, max-age=31536000, immutable');

    // `onlyIf` não satisfeito: o R2 devolve o objeto sem corpo → 304.
    if (!('body' in objeto)) return new Response(null, { status: 304, headers: h });

    const r = (objeto as R2ObjectBody).range as { offset?: number; length?: number } | undefined;
    if (req.headers.has('Range') && r && r.offset !== undefined && r.length !== undefined) {
      h.set('Content-Range', `bytes ${r.offset}-${r.offset + r.length - 1}/${objeto.size}`);
      h.set('Content-Length', String(r.length));
      return new Response(req.method === 'HEAD' ? null : (objeto as R2ObjectBody).body, { status: 206, headers: h });
    }
    h.set('Content-Length', String(objeto.size));
    return new Response(req.method === 'HEAD' ? null : (objeto as R2ObjectBody).body, { status: 200, headers: h });
  },
};
