#!/usr/bin/env node
/**
 * Gera um vídeo de teste do Player Insano e converte com `video-hls.mjs`.
 *
 *   node scripts/video-teste.mjs
 *
 * O vídeo: 120 s, vertical 1080x1920, padrão de teste do ffmpeg (testsrc2) com
 * o segundo atual ENORME no meio e um bipe a cada segundo (dá para ouvir se o
 * som ligou e se áudio e imagem estão juntos). Serve para testar o player sem
 * a VSL de verdade: marcos de tempo, barra falsa, retomar, métricas.
 *
 * Saída em `public/videos-teste/teste/` (no .gitignore — não commitar).
 * Em `next dev`, fica em `/videos-teste/teste/master.m3u8`.
 */

import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pasta = path.join(raiz, 'public', 'videos-teste');
const fonte = path.join(pasta, 'teste-fonte.mp4');
const saida = path.join(pasta, 'teste');

const DURACAO = 120;

function rodar(programa, args) {
  return new Promise((resolve, reject) => {
    const filho = spawn(programa, args, { stdio: 'inherit', windowsHide: true });
    filho.on('error', (e) =>
      reject(e.code === 'ENOENT' ? new Error(`"${programa}" não encontrado no PATH.`) : e),
    );
    filho.on('close', (c) => (c === 0 ? resolve() : reject(new Error(`${programa} terminou com código ${c}`))));
  });
}

/** Fonte para o drawtext. No Windows o fontconfig nem sempre acha "Sans". */
function fonteDoTexto() {
  const candidatos = [
    'C:/Windows/Fonts/arialbd.ttf',
    'C:/Windows/Fonts/arial.ttf',
    '/System/Library/Fonts/Supplemental/Arial Bold.ttf',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
  ];
  const achada = candidatos.find((c) => existsSync(c));
  // Dentro do filtro, ":" separa opções: escapa o "C:".
  return achada ? `fontfile='${achada.replace(/:/g, '\\:')}'` : 'font=Sans';
}

async function main() {
  mkdirSync(pasta, { recursive: true });

  const texto = [
    fonteDoTexto(),
    "text='%{eif\\:t\\:d}'",
    'fontsize=420',
    'fontcolor=white',
    'borderw=16',
    'bordercolor=black',
    'x=(w-text_w)/2',
    'y=(h-text_h)/2',
  ].join(':');
  const legenda = [
    fonteDoTexto(),
    "text='Player Insano - teste'",
    'fontsize=64',
    'fontcolor=white',
    'box=1',
    'boxcolor=black@0.6',
    'boxborderw=20',
    'x=(w-text_w)/2',
    'y=h*0.12',
  ].join(':');

  console.log(`Gerando ${DURACAO} s de vídeo de teste (1080x1920)…`);
  await rodar('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-stats', '-y',
    '-f', 'lavfi', '-i', `testsrc2=size=1080x1920:rate=30:duration=${DURACAO}`,
    // Bipe de 1 kHz no início de cada segundo sobre um tom de 440 Hz.
    '-f', 'lavfi', '-i', `sine=frequency=440:beep_factor=2:sample_rate=48000:duration=${DURACAO}`,
    '-vf', `drawtext=${texto},drawtext=${legenda}`,
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '160k',
    '-shortest',
    fonte,
  ]);

  console.log('\nConvertendo para HLS…\n');
  await rodar(process.execPath, [path.join(raiz, 'scripts', 'video-hls.mjs'), fonte, saida, '--vertical', '--forcar']);

  rmSync(fonte, { force: true });
}

main().catch((e) => {
  console.error(`\n✖ ${e.message}\n`);
  process.exit(1);
});
