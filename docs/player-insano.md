# Player Insano — vídeo e métricas

O nosso player de VSL, no lugar do VTurb. Este documento cobre a parte de
**vídeo** (converter e hospedar) e de **métricas** (`/api/player` + Supabase).
O contrato do componente está em `src/components/player/tipos.ts`.

## 1. Converter uma VSL

Precisa do `ffmpeg` (com `ffprobe`) no PATH.

```bash
node scripts/video-hls.mjs caminho/da-vsl.mp4 saida/vsl-downsell --vertical
```

- O **nome da pasta de saída** vira o id do vídeo (`VideoInsano.id`) e o nome
  do MP4: só `a-z`, `0-9`, `_` e `-`.
- Gera `master.m3u8`, uma pasta por qualidade (`LxA/index.m3u8`, `init_N.mp4`,
  `seg_NNN.m4s` de ~4 s), `<id>.mp4` de reserva (~540p, `+faststart`) e
  `poster.jpg` (quadro em ~1 s).
- Escada: o topo é a resolução do original (até 720p), mais até duas menores
  na **mesma proporção** — nunca aumenta, nunca distorce, nunca põe tarja.
  Ex.: 1080x1920 → 720x1280 / 540x960 / 360x640; 404x720 (VSLs atuais do
  VTurb) → 404x720 / 270x480 / 202x360. O bitrate nunca passa o do original.
- Keyframe a cada 2 s, sem keyframe por troca de cena: as qualidades trocam
  limpo no meio do vídeo. `--ts` gera MPEG-TS no lugar de fMP4 (os dois tocam
  no hls.js e no Safari). `--forcar` refaz uma pasta já convertida.
- No fim, imprime os tamanhos e o bloco pronto para o `VideoInsano`.

Teste sem VSL de verdade: `node scripts/video-teste.mjs` gera 120 s com o
segundo na tela e um bipe por segundo em `public/videos-teste/teste/`
(no `.gitignore`; em `next dev` fica em `/videos-teste/teste/master.m3u8`).

**Não commitar vídeo.** O vídeo de produção vai para um storage/CDN (abaixo).

## 2. Onde hospedar

Ordem de grandeza (10 mil plays por mês de uma VSL de 10 min):

| Qualidade de topo | MB/min | Todos até o fim | Realista (~35% assistido) |
| --- | --- | --- | --- |
| 720x1280 (fonte 1080p) | ~19 | ~1,9 TB | ~0,5–0,7 TB |
| 404x720 (fontes atuais) | ~4,6 | ~0,45 TB | ~0,15–0,2 TB |

O armazenamento é irrelevante (< 1 GB por VSL). O que custa é a **saída**.

| Opção | Custo aprox./mês | Observações |
| --- | --- | --- |
| **Cloudflare R2** + domínio próprio (ex.: `video.abdomeninsano.com.br`) | ~US$ 0–1 | **Sem taxa de saída.** Armazenamento ~US$ 0,015/GB; leituras ~US$ 0,36/milhão com 10 milhões grátis (10 mil plays ≈ até 1,5 milhão de leituras). Use domínio próprio: a URL `r2.dev` é só para teste (limitada). O domínio precisa estar numa zona da Cloudflare na mesma conta. Verificar preço atual. |
| **Bunny Storage + CDN** | ~US$ 10–90 (rede padrão) ou ~US$ 1–10 (rede "volume") | CDN ~US$ 0,045/GB na América do Sul na rede padrão, ~US$ 0,005/GB na rede volume (menos pontos de presença); armazenamento ~US$ 0,01/GB; mínimo ~US$ 1/mês. Verificar preço atual. |
| **Vercel Blob** | ~US$ 10–100+ | Cobra transferência por GB (varia por região; São Paulo é das mais caras) e operações. Simples de usar com o projeto. Verificar preço atual. |
| `public/` do próprio deploy na Vercel | consome o Fast Data Transfer do plano | **Não recomendado** para VSL: incha cada deploy, sai do mesmo pacote de banda do site e não tem controle de cache próprio. OK só para teste. |

Recomendação: **R2 com domínio próprio**. Bunny é a alternativa se o DNS não
puder ir para a Cloudflare.

### Cabeçalhos (CORS e cache)

O hls.js baixa playlists e segmentos por `fetch`/XHR. Se o vídeo estiver em
outro domínio (ex.: `video.…`), o servidor do vídeo precisa responder:

```
Access-Control-Allow-Origin: https://www.abdomeninsano.com.br   (ou a lista de origens)
Access-Control-Allow-Methods: GET, HEAD
Access-Control-Allow-Headers: Range
Access-Control-Expose-Headers: Content-Length, Content-Range
```

CORS do bucket no R2 (Settings → CORS policy):

```json
[
  {
    "AllowedOrigins": ["https://www.abdomeninsano.com.br", "https://abdomeninsano.com.br", "http://localhost:3000"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["Range"],
    "ExposeHeaders": ["Content-Length", "Content-Range"],
    "MaxAgeSeconds": 86400
  }
]
```

No Bunny: Pull Zone → "Add CORS headers", com `m3u8`, `m4s`, `mp4`, `jpg` na
lista de extensões.

Também:

- `Content-Type`: `.m3u8` → `application/vnd.apple.mpegurl`; `.m4s` →
  `video/iso.segment` (ou `video/mp4`); `.mp4` → `video/mp4`. Conferir depois
  do upload (algumas ferramentas mandam `application/octet-stream`).
- `Cache-Control: public, max-age=31536000, immutable` em tudo. Para trocar o
  vídeo, **suba numa pasta nova** (`vsl-downsell-v2/`) em vez de sobrescrever.
- `<link rel="preconnect" href="https://video.abdomeninsano.com.br" crossorigin>`
  na página da VSL.

## 3. Trocar uma página do VTurb para o Player Insano

Visão geral (o código do funil ganha uma opção `fonte`):

1. Converter a VSL, subir a pasta e montar o `VideoInsano` com o bloco que o
   script imprime (`hls`, `mp4`, `poster`, `proporcao`, `duracao`).
2. Na configuração da página do funil, trocar `fonte: 'vturb'` por
   `fonte: 'insano'` e passar o `VideoInsano`.
3. Copiar os tempos de revelação dos botões do VTurb para `marcos`. São
   segundos de **conteúdo**, como no VTurb: a velocidade (1,2x) não muda os
   números.
4. Métricas: aplicar `supabase/player_eventos.sql` e ligar `PLAYER_GRAVAR=1` na
   Vercel (com as variáveis do Supabase já existentes).
5. Comparar conversão por alguns dias. Para voltar, `fonte: 'vturb'`.

## 4. Métricas

`POST /api/player` recebe o `LotePlayer` (via `navigator.sendBeacon`):

- Corpo como **string** (vira `text/plain`, sem preflight); até 200 eventos e
  32 KB por lote. Mandar a cada ~15–30 s e no `pagehide`.
- Valida origem (só o nosso site), formato de cada campo e limita 60 lotes por
  minuto por IP (em memória, por instância). Responde sempre 204.
- Grava só com `PLAYER_GRAVAR=1`: uma linha por evento em
  `public.player_eventos`. **Sem IP e sem user agent.**
- Privacidade: apagar eventos com mais de 90 dias (query no topo do SQL).

### Ler a retenção

No SQL editor do Supabase:

```sql
select * from public.player_retencao('vsl-downsell', now() - interval '7 days');
```

Uma linha por bloco de 5 s: `sessoes_com_som` (quantas chegaram ali **com
som**), `pct_dos_com_som` (a curva clássica de VSL: % de quem ligou o som),
`pct_do_total` (% de todas as visitas) e `pct_som` (% das visitas que ligaram o
som — igual em todas as linhas). A função só roda com a service role; pelo
servidor: `supabaseAdmin().rpc('player_retencao', { video, desde })`.

## 5. Recursos extras (catálogo do VTurb)

Levantados em 26/11/2026 no editor do VTurb (só o comportamento, nunca o
código). **Tudo desligado por padrão**: sem opção nova, o player é o de antes.
Contrato completo em `src/components/player/tipos.ts`; para testar todos de uma
vez, `/player-teste?modo=completo` (e `?modo=filtro` para o filtro de tráfego).

No funil, as opções vão em `vsl.proprio` (`src/content/desafio.ts`):

```ts
proprio: {
  base: 'https://…/downsell/v1',
  proporcao: 404 / 720,
  duracao: 108.5,
  pixels: true, // VSL_25, VSL_50, VSL_75, VSL_100 (eventos personalizados)
  opcoes: {
    pausaInteligente: true,
    rolarAte: { segundos: 61, seletor: '.funil__acoes' },
    jaAssistiu: true,
    ganchos: [{ de: 40, ate: 48, texto: 'O preço vem agora' }],
    miniPlayer: true,
  },
},
```

| VTurb | Opção do Player Insano |
| --- | --- |
| Smart Autoplay (textos) | `textosAutoplay` |
| Continuar assistindo (textos, "já assistiu") | `textosRetomar`, `jaAssistiu` |
| Smart Pause | `pausaInteligente` |
| Desativar pause | `bloquearPausa` |
| Recomeçar o vídeo após o fim | `repetirAoTerminar` |
| Ir para seu elemento | `rolarAte: { segundos, seletor }` |
| Qualidade inicial | `qualidadeInicial` (só hls.js) |
| Headlines / Mini-Ganchos | `ganchos` (`lugar: 'acima'` ou `'video'`) |
| ThumbSniper | `thumbs` (faixa de tempo ou `noFim`) |
| Controles (tempo, volume, ±10 s, velocidade, barra, tela cheia) | `controles` |
| Capítulos | `capitulos` (marcas na barra real + menu) |
| Legendas | `legendas` (WebVTT; CORS se for outro domínio) |
| Experiência Fullscreen | `imersivo` (celular/desktop, expandir ao tocar, minimizar ao pausar) |
| Picture in Picture | `miniPlayer` |
| Pixels | `pixels: true` no funil, ou `marcosDePixel()` (só com som, uma vez por visita) |
| Teste A/B (autoplay, velocidade…) | `teste: { id, variantes, vencedora? }` |
| Filtro de Tráfego | `filtro: { dispositivos, idiomas, paises, chaveUrl, alternativo }` |

Cuidados:

- **Barra real, ±10 s e capítulos deixam a pessoa pular para a oferta.** É por
  isso que o VTurb (e o funil) usam a barra falsa. Só ligar sabendo disso.
- **Filtro de tráfego**: quem é bloqueado vê o `alternativo` (ou nenhum vídeo)
  e os botões da oferta aparecem **na hora**: o filtro nunca prende quem pagou.
  País vem do cabeçalho da Vercel (`GET /api/player`); em dev é desconhecido e
  passa. Ficaram de fora o "Bloquear Proxy/VPN" e o "Token de Acesso" do VTurb:
  o primeiro precisa de um serviço pago de reputação de IP; o segundo, de
  assinatura no servidor.
- **Teste A/B**: o VTurb escolhe o vencedor sozinho; aqui, compare com
  `player_variantes` e fixe com `teste.vencedora`:

  ```sql
  select * from public.player_variantes('vsl-downsell', now() - interval '14 days');
  ```

- **Pixels** usam `trackSingleCustom` no nosso pixel (compartilhado com outro
  funil, ver `lib/pixel.ts`): evento personalizado, nunca padrão.
