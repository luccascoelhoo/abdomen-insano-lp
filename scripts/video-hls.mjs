#!/usr/bin/env node
/**
 * Converte uma VSL para o Player Insano: HLS adaptativo + MP4 de reserva + pôster.
 *
 *   node scripts/video-hls.mjs <entrada.mp4> <saida-dir> [--vertical] [--ts] [--forcar]
 *
 *   --vertical  diz que a VSL é vertical (9:16 ou parecido). Só confere: se o
 *               vídeo não for vertical, avisa. A proporção vem SEMPRE do original.
 *   --ts        segmentos MPEG-TS em vez de fMP4 (.m4s). fMP4 é o padrão:
 *               hls.js e Safari (iOS 10+) tocam os dois.
 *   --forcar    a pasta de saída já tem uma conversão: apaga SÓ o que este
 *               script cria (master.m3u8, pastas LxA/, <nome>.mp4, poster.jpg)
 *               e converte de novo.
 *
 * ESCADA DE QUALIDADES (até 3, nunca aumenta o original, nunca distorce nem
 * põe tarja):
 *  - topo: a resolução do original (arredondada para par), limitada a 720p
 *    (lado longo ≤ 1280, lado curto ≤ 720);
 *  - abaixo dele, as duas primeiras de 960 / 640 / 480 / 360 px de lado longo
 *    que sejam pelo menos 15% menores que o topo, na mesma proporção.
 *  Ex.: 1080x1920 → 720x1280, 540x960, 360x640.
 *       404x720  → 404x720, 270x480, 202x360.
 *  Bitrate por área (≈ 500 kbps em 360x640, 1200 em 540x960, 2500 em
 *  720x1280), nunca acima do bitrate do vídeo original.
 *
 * Saída (`<nome>` = nome da pasta de saída, que deve ser o id do vídeo):
 *   master.m3u8        playlist mestre (aponte `VideoInsano.hls` para cá)
 *   <L>x<A>/           playlist + segmentos de ~4 s de cada qualidade
 *   <nome>.mp4         reserva (lado longo ≤ 960, ~540p), +faststart (`VideoInsano.mp4`)
 *   poster.jpg         quadro em ~1 s, no tamanho do topo (`VideoInsano.poster`)
 *
 * Precisa de `ffmpeg` e `ffprobe` no PATH. Roda com `spawn` e lista de
 * argumentos (sem shell), então caminho com espaço não quebra nada.
 */

import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import path from 'node:path';

/* -------------------------------------------------------------- configuração */

/** Duração-alvo de cada segmento HLS (s). */
const SEGUNDOS_SEGMENTO = 4;
/** Um keyframe a cada 2 s: cada segmento de 4 s começa num keyframe. */
const SEGUNDOS_GOP = 2;
/** Teto de quadros por segundo. VSL não precisa de 60 fps nesses bitrates. */
const FPS_MAXIMO = 30;

/** Teto do topo da escada (720p). */
const MAX_LADO_LONGO = 1280;
const MAX_LADO_CURTO = 720;
/** Degraus abaixo do topo (lado longo, px). */
const DEGRAUS = [960, 640, 480, 360];
/** Um degrau só entra se for ao menos 15% menor que o de cima. */
const FOLGA_DEGRAU = 0.85;
const MAX_QUALIDADES = 3;
/** A reserva MP4 é a maior qualidade com lado longo até aqui (~540p). */
const LONGO_RESERVA = 960;

/** Bitrate de vídeo (kbps) por área (px), interpolado entre estes pontos. */
const BITRATE_POR_AREA = [
  [202 * 360, 200],
  [270 * 480, 300],
  [360 * 640, 500],
  [540 * 960, 1200],
  [720 * 1280, 2500],
];

/* ------------------------------------------------------------------ helpers */

function falhar(msg) {
  console.error(`\n✖ ${msg}\n`);
  process.exit(1);
}

function uso() {
  console.log(
    [
      'Uso: node scripts/video-hls.mjs <entrada.mp4> <saida-dir> [--vertical] [--ts] [--forcar]',
      '',
      'Exemplo:',
      '  node scripts/video-hls.mjs ~/Videos/vsl-downsell.mp4 saida/vsl-downsell --vertical',
    ].join('\n'),
  );
}

/** Roda um programa. stderr vai para o terminal (progresso), a menos que `capturar`. */
function rodar(programa, args, { capturar = false, cwd } = {}) {
  return new Promise((resolve, reject) => {
    const filho = spawn(programa, args, {
      stdio: ['ignore', capturar ? 'pipe' : 'inherit', capturar ? 'pipe' : 'inherit'],
      cwd,
      windowsHide: true,
    });
    let saida = '';
    let erro = '';
    if (capturar) {
      filho.stdout.on('data', (d) => (saida += d));
      filho.stderr.on('data', (d) => (erro += d));
    }
    filho.on('error', (e) =>
      reject(
        e.code === 'ENOENT'
          ? new Error(`"${programa}" não encontrado no PATH. Instale o ffmpeg (inclui o ffprobe).`)
          : e,
      ),
    );
    filho.on('close', (codigo) => {
      if (codigo === 0) resolve(saida);
      else reject(new Error(`${programa} terminou com código ${codigo}${erro ? `:\n${erro.trim()}` : ''}`));
    });
  });
}

/** "30000/1001" → 29.97 */
function fracao(s) {
  const [a, b] = String(s ?? '').split('/').map(Number);
  if (!a || !Number.isFinite(a)) return 0;
  return b ? a / b : a;
}

const par = (n) => Math.max(2, Math.round(n / 2) * 2);

function kbpsPorArea(area) {
  const t = BITRATE_POR_AREA;
  if (area <= t[0][0]) return t[0][1];
  for (let i = 1; i < t.length; i++) {
    const [a0, k0] = t[i - 1];
    const [a1, k1] = t[i];
    if (area <= a1) return k0 + ((area - a0) / (a1 - a0)) * (k1 - k0);
  }
  return t[t.length - 1][1];
}

function tamanhoDe(caminho) {
  const st = statSync(caminho);
  if (st.isFile()) return st.size;
  return readdirSync(caminho).reduce((soma, f) => soma + tamanhoDe(path.join(caminho, f)), 0);
}

function mb(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB`;
}

/* ------------------------------------------------------------------ análise */

async function analisar(entrada) {
  let json;
  try {
    json = JSON.parse(
      await rodar(
        'ffprobe',
        ['-v', 'error', '-print_format', 'json', '-show_streams', '-show_format', entrada],
        { capturar: true },
      ),
    );
  } catch (e) {
    falhar(`não consegui ler "${entrada}" com o ffprobe. É mesmo um vídeo?\n${e.message}`);
  }
  const video = json.streams?.find((s) => s.codec_type === 'video' && s.disposition?.attached_pic !== 1);
  if (!video || !video.width || !video.height) falhar(`"${entrada}" não tem trilha de vídeo.`);
  const audio = json.streams?.find((s) => s.codec_type === 'audio');

  // Vídeo de celular costuma vir "deitado" com metadado de rotação.
  const rot = Math.abs(
    Number(video.tags?.rotate ?? video.side_data_list?.find((d) => d.rotation != null)?.rotation ?? 0),
  );
  const deitado = rot === 90 || rot === 270;
  const largura = deitado ? video.height : video.width;
  const altura = deitado ? video.width : video.height;

  const fpsOrigem = fracao(video.avg_frame_rate) || fracao(video.r_frame_rate) || 30;
  // Até 30 fps mantém a taxa exata (ex.: 30000/1001); acima, cai para 30.
  const manter = fpsOrigem <= FPS_MAXIMO + 0.5 && /^\d+(\/\d+)?$/.test(String(video.avg_frame_rate));
  const fps = manter ? String(video.avg_frame_rate) : String(FPS_MAXIMO);
  const fpsNum = manter ? fpsOrigem : FPS_MAXIMO;
  const duracao = Number(json.format?.duration ?? video.duration ?? 0);

  // Bitrate do vídeo original (kbps): teto para não "inflar" um vídeo já comprimido.
  const audioKbps = Number(audio?.bit_rate ?? 0) / 1000;
  const videoKbps =
    Number(video.bit_rate ?? 0) / 1000 || Math.max(0, Number(json.format?.bit_rate ?? 0) / 1000 - audioKbps);

  return { largura, altura, fps, fpsNum, fpsOrigem, duracao, temAudio: Boolean(audio), videoKbps, audioKbps };
}

/** Monta a escada a partir do original (ver cabeçalho). */
function montarEscada(info) {
  const { largura, altura } = info;
  const longoOrig = Math.max(largura, altura);
  const curtoOrig = Math.min(largura, altura);
  const horizontal = largura >= altura;
  const fator = Math.min(1, MAX_LADO_LONGO / longoOrig, MAX_LADO_CURTO / curtoOrig);

  const dims = (longo) => {
    const l = par(longo);
    const c = par((longo * curtoOrig) / longoOrig);
    return horizontal ? { w: l, h: c } : { w: c, h: l };
  };

  const topo = dims(longoOrig * fator);
  const lista = [topo];
  let ultimoLongo = Math.max(topo.w, topo.h);
  for (const d of DEGRAUS) {
    if (lista.length >= MAX_QUALIDADES) break;
    if (d <= ultimoLongo * FOLGA_DEGRAU) {
      lista.push(dims(d));
      ultimoLongo = d;
    }
  }

  return lista.map(({ w, h }) => {
    const longo = Math.max(w, h);
    let video = kbpsPorArea(w * h);
    if (info.videoKbps > 0) video = Math.min(video, info.videoKbps);
    video = Math.max(100, Math.round(video / 25) * 25);
    let audio = longo > 700 ? 128 : 96;
    if (info.audioKbps > 0) audio = Math.min(audio, Math.max(64, Math.ceil(info.audioKbps / 16) * 16));
    return { nome: `${w}x${h}`, w, h, longo, video, audio, perfil: longo <= 640 ? 'main' : 'high' };
  });
}

/* ------------------------------------------------------------------- etapas */

function filtroEscala(w, h) {
  // Mesma proporção do original (só arredondamento para par): sem tarja, sem distorção.
  return `scale=${w}:${h}:flags=lanczos,setsar=1`;
}

/** Opções do H.264 de uma qualidade. `spec` = especificador de stream ("v" ou "v:0"). */
function argsVideo(spec, q, info) {
  const gop = String(Math.round(SEGUNDOS_GOP * info.fpsNum));
  return [
    `-c:${spec}`, 'libx264',
    `-profile:${spec}`, q.perfil,
    `-preset:${spec}`, 'medium',
    `-b:${spec}`, `${q.video}k`,
    `-maxrate:${spec}`, `${Math.round(q.video * 1.1)}k`,
    `-bufsize:${spec}`, `${Math.round(q.video * 1.5)}k`,
    `-g:${spec}`, gop,
    `-keyint_min:${spec}`, gop,
    `-sc_threshold:${spec}`, '0',
    `-pix_fmt:${spec}`, 'yuv420p',
  ];
}

function argsAudio(spec, q) {
  return [`-c:${spec}`, 'aac', `-b:${spec}`, `${q.audio}k`, `-ac:${spec}`, '2', `-ar:${spec}`, '48000'];
}

async function gerarHls(entrada, saida, info, qualidades, ts) {
  const n = qualidades.length;
  const escalas = qualidades.map((q, i) => `[s${i}]${filtroEscala(q.w, q.h)}[v${i}]`).join(';');
  const filtro = `[0:v:0]fps=${info.fps},split=${n}${qualidades.map((_, i) => `[s${i}]`).join('')};${escalas}`;

  const args = ['-hide_banner', '-loglevel', 'error', '-stats', '-y', '-i', entrada, '-filter_complex', filtro];
  qualidades.forEach((q, i) => args.push('-map', `[v${i}]`, ...argsVideo(`v:${i}`, q, info)));
  if (info.temAudio) qualidades.forEach((q, i) => args.push('-map', '0:a:0', ...argsAudio(`a:${i}`, q)));

  const mapa = qualidades
    .map((q, i) => (info.temAudio ? `v:${i},a:${i},name:${q.nome}` : `v:${i},name:${q.nome}`))
    .join(' ');
  const extensao = ts ? 'ts' : 'm4s';
  args.push(
    '-f', 'hls',
    '-hls_time', String(SEGUNDOS_SEGMENTO),
    '-hls_playlist_type', 'vod',
    '-hls_flags', 'independent_segments',
    '-hls_segment_type', ts ? 'mpegts' : 'fmp4',
    ...(ts ? [] : ['-hls_fmp4_init_filename', 'init.mp4']),
    // Caminhos RELATIVOS com "/" e o ffmpeg rodando dentro da pasta de saída:
    // com caminho absoluto do Windows, o ffmpeg escreve barra invertida nas
    // playlists e solta os init_N.mp4 fora das pastas das qualidades.
    '-hls_segment_filename', `%v/seg_%03d.${extensao}`,
    '-master_pl_name', 'master.m3u8',
    '-var_stream_map', mapa,
    '%v/index.m3u8',
  );
  for (const q of qualidades) mkdirSync(path.join(saida, q.nome), { recursive: true });
  await rodar('ffmpeg', args, { cwd: saida });
}

async function gerarMp4(entrada, destino, info, q) {
  const args = [
    '-hide_banner', '-loglevel', 'error', '-stats', '-y', '-i', entrada,
    '-map', '0:v:0',
    '-vf', `fps=${info.fps},${filtroEscala(q.w, q.h)}`,
    ...argsVideo('v', q, info),
  ];
  if (info.temAudio) args.push('-map', '0:a:0', ...argsAudio('a', q));
  args.push('-movflags', '+faststart', destino);
  await rodar('ffmpeg', args);
}

async function gerarPoster(entrada, destino, info, q) {
  const em = info.duracao > 1.5 ? 1 : 0;
  await rodar('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-y',
    '-ss', String(em), '-i', entrada,
    '-frames:v', '1',
    '-vf', filtroEscala(q.w, q.h),
    '-q:v', '3',
    destino,
  ]);
}

/* -------------------------------------------------------------------- main */

async function main() {
  const brutos = process.argv.slice(2);
  if (brutos.includes('-h') || brutos.includes('--help')) {
    uso();
    return;
  }
  const flags = new Set(brutos.filter((a) => a.startsWith('--')));
  const posicionais = brutos.filter((a) => !a.startsWith('--'));
  const conhecidas = new Set(['--vertical', '--ts', '--forcar']);
  for (const f of flags) if (!conhecidas.has(f)) falhar(`opção desconhecida: ${f}. Use --vertical, --ts ou --forcar.`);
  if (posicionais.length !== 2) {
    uso();
    falhar('informe a entrada e a pasta de saída (nessa ordem).');
  }

  const entrada = path.resolve(posicionais[0]);
  const saida = path.resolve(posicionais[1]);
  const vertical = flags.has('--vertical');
  const ts = flags.has('--ts');

  if (!existsSync(entrada) || !statSync(entrada).isFile()) falhar(`arquivo de entrada não encontrado: ${entrada}`);
  if (statSync(entrada).size === 0) falhar(`arquivo de entrada vazio: ${entrada}`);

  const nome = path.basename(saida);
  if (!/^[a-z0-9_-]{1,64}$/.test(nome)) {
    falhar(
      `o nome da pasta de saída ("${nome}") vira o id do vídeo e o nome do MP4: use só a-z, 0-9, "_" e "-" (até 64).`,
    );
  }

  if (existsSync(saida)) {
    if (!statSync(saida).isDirectory()) falhar(`a saída existe e não é uma pasta: ${saida}`);
    const itens = readdirSync(saida);
    if (itens.length > 0 && !flags.has('--forcar')) {
      falhar(`a pasta de saída não está vazia: ${saida}\nUse --forcar para refazer a conversão (apaga só os arquivos deste script).`);
    }
    // Só o que este script cria: playlists, pastas de qualidade, MP4 e pôster.
    const nosso = (f) =>
      f === 'master.m3u8' || f === 'poster.jpg' || f === `${nome}.mp4` || /^(\d+x\d+|\d+p)$/.test(f);
    for (const f of itens.filter(nosso)) rmSync(path.join(saida, f), { recursive: true, force: true });
  }
  mkdirSync(saida, { recursive: true });

  const info = await analisar(entrada);
  const ehVertical = info.altura > info.largura;
  if (vertical !== ehVertical) {
    console.warn(
      `⚠ o vídeo é ${info.largura}x${info.altura} (${ehVertical ? 'vertical' : 'horizontal'})` +
        (vertical ? ', mas foi passado --vertical.' : '; passe --vertical para confirmar.') +
        ' A escada segue a proporção do original.',
    );
  }

  const qualidades = montarEscada(info);
  const reserva = qualidades.find((q) => q.longo <= LONGO_RESERVA) ?? qualidades[qualidades.length - 1];
  const topo = qualidades[0];

  console.log(
    [
      `Entrada:    ${entrada}`,
      `            ${info.largura}x${info.altura}, ${info.fpsOrigem.toFixed(2)} fps, ${info.duracao.toFixed(1)} s, ` +
        (info.videoKbps ? `${Math.round(info.videoKbps)} kbps de vídeo, ` : '') +
        (info.temAudio ? 'com áudio' : 'SEM áudio'),
      `Saída:      ${saida}`,
      `Qualidades: ${qualidades.map((q) => `${q.nome} (${q.video}+${info.temAudio ? q.audio : 0} kbps)`).join(', ')}`,
      `Segmentos:  ${ts ? 'MPEG-TS' : 'fMP4'}, ~${SEGUNDOS_SEGMENTO} s, keyframe a cada ${SEGUNDOS_GOP} s`,
      '',
    ].join('\n'),
  );

  const t0 = Date.now();
  console.log('1/3 HLS…');
  await gerarHls(entrada, saida, info, qualidades, ts);
  console.log(`2/3 MP4 de reserva (${reserva.nome})…`);
  await gerarMp4(entrada, path.join(saida, `${nome}.mp4`), info, reserva);
  console.log('3/3 pôster…');
  await gerarPoster(entrada, path.join(saida, 'poster.jpg'), info, topo);

  /* ---- resumo */
  const linhas = [];
  let total = 0;
  for (const q of qualidades) {
    const pasta = path.join(saida, q.nome);
    const bytes = tamanhoDe(pasta);
    const segs = readdirSync(pasta).filter((f) => f.startsWith('seg_')).length;
    total += bytes;
    const porMin = info.duracao > 0 ? ` (${mb((bytes / info.duracao) * 60)}/min)` : '';
    linhas.push(`  ${q.nome}/`.padEnd(22) + `${mb(bytes).padStart(10)}  ${segs} segmentos${porMin}`);
  }
  for (const f of ['master.m3u8', `${nome}.mp4`, 'poster.jpg']) {
    const bytes = tamanhoDe(path.join(saida, f));
    total += bytes;
    linhas.push(`  ${f}`.padEnd(22) + mb(bytes).padStart(10));
  }
  const proporcao = `${topo.w} / ${topo.h}`;
  console.log(
    [
      '',
      `✔ pronto em ${((Date.now() - t0) / 1000).toFixed(0)} s`,
      ...linhas,
      `  ${'total'.padEnd(20)}${mb(total).padStart(10)}`,
      '',
      'No VideoInsano:',
      `  id: '${nome}',`,
      `  hls: '<base>/${nome}/master.m3u8',`,
      `  mp4: '<base>/${nome}/${nome}.mp4',`,
      `  poster: '<base>/${nome}/poster.jpg',`,
      `  proporcao: ${proporcao},`,
      `  duracao: ${Math.round(info.duracao)},`,
    ].join('\n'),
  );
}

main().catch((e) => falhar(e.message));
