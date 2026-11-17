#!/usr/bin/env node
/**
 * Envia uma pasta gerada por `scripts/video-hls.mjs` para o bucket R2 do
 * Player Insano, arquivo por arquivo, com o Content-Type certo.
 *
 *   node scripts/video-enviar.mjs <pasta-local> <bucket> <prefixo>
 *   ex.: node scripts/video-enviar.mjs public/videos-teste/downsell videos-insano downsell/v1
 *
 * Usa o `wrangler` instalado em infra/video-worker (precisa de
 * `npx wrangler login` feito uma vez). Cada versão de vídeo vai para um
 * prefixo novo (v1, v2…): o Worker serve segmentos com cache de 1 ano.
 */
import { spawnSync } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import { join, relative, resolve, sep, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const TIPOS = {
  m3u8: 'application/vnd.apple.mpegurl',
  m4s: 'video/iso.segment',
  mp4: 'video/mp4',
  ts: 'video/mp2t',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
};

const [pastaArg, bucket, prefixoArg] = process.argv.slice(2);
if (!pastaArg || !bucket || !prefixoArg) {
  console.error('Uso: node scripts/video-enviar.mjs <pasta-local> <bucket> <prefixo>');
  process.exit(1);
}
if (!/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(bucket)) {
  console.error(`Nome de bucket inválido: ${bucket}`);
  process.exit(1);
}
const prefixo = prefixoArg.replace(/^\/+|\/+$/g, '');
if (!/^[\w\-./]+$/.test(prefixo) || prefixo.split('/').includes('..')) {
  console.error(`Prefixo inválido: ${prefixoArg}`);
  process.exit(1);
}

const pasta = resolve(pastaArg);
const raizWorker = join(dirname(fileURLToPath(import.meta.url)), '..', 'infra', 'video-worker');

function listar(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? listar(p) : [p];
  });
}

const arquivos = listar(pasta).filter((p) => TIPOS[p.split('.').pop()?.toLowerCase() ?? '']);
if (!arquivos.length) {
  console.error(`Nenhum arquivo de vídeo em ${pasta}`);
  process.exit(1);
}

// Playlists por último: quem abrir o vídeo no meio do envio não pega um
// master.m3u8 apontando para segmentos que ainda não subiram.
arquivos.sort((a, b) => Number(a.endsWith('.m3u8')) - Number(b.endsWith('.m3u8')) || a.localeCompare(b));

let bytes = 0;
for (const [i, arquivo] of arquivos.entries()) {
  const chave = `${prefixo}/${relative(pasta, arquivo).split(sep).join('/')}`;
  const tipo = TIPOS[arquivo.split('.').pop().toLowerCase()];
  const r = spawnSync(
    'npx',
    ['wrangler', 'r2', 'object', 'put', `${bucket}/${chave}`, '--file', arquivo, '--content-type', tipo, '--remote'],
    { cwd: raizWorker, stdio: ['ignore', 'pipe', 'pipe'], shell: process.platform === 'win32', encoding: 'utf8' },
  );
  if (r.status !== 0) {
    console.error(`\nFalhou em ${chave}:\n${r.stderr || r.stdout}`);
    process.exit(1);
  }
  bytes += statSync(arquivo).size;
  process.stdout.write(`\r${i + 1}/${arquivos.length} enviados (${(bytes / 1e6).toFixed(1)} MB)`);
}
console.log(`\nPronto: ${arquivos.length} arquivos em ${bucket}/${prefixo}/`);
