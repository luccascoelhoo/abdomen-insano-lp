# Recursos do player VTurb x Player Insano

Levantado em 26/11/2026 com o REA, só lendo:
- `player.js` do downsell (configuração do player `6ad909948b6fe1ef3d42e9dd`);
- painel do VTurb, tela Editar desse vídeo (13 seções), versão do painel v1.20.23.

Nada foi salvo nem alterado na conta. Serve para reimplementar o **comportamento**
no nosso player, nunca para copiar o código do VTurb.

Legenda: **no VTurb** = ligado neste vídeo; **nosso** = o Player Insano já faz.

| Seção do painel | Opções | No VTurb | Nosso |
| --- | --- | --- | --- |
| Estilo | cor sólida ou gradiente, cor de fundo, cantos arredondados | sólido, fundo preto, canto 0 | sim (cor) |
| Estilo › Controles | play grande, play pequeno, desativar pause, barra de progresso real, tempo do vídeo, voltar 10 s, avançar 10 s, volume, tela cheia, controle de velocidade | play pequeno + tela cheia | play/pausa + tela cheia |
| Estilo › Capítulos | marcadores de capítulo na barra | desligado | não |
| Progresso Inteligente | cor (ou a do play grande), altura | ligado, alpha 2, altura 10, #ff6b00 | sim |
| Smart Autoplay | aviso "Seu vídeo já começou / Clique para ouvir"; **teste A/B de vários avisos**, mostra só o vencedor | ligado (1 aviso) | sim (sem teste A/B) |
| Turbo | velocidade manual ou **teste automático de velocidade** | 1,2x manual | sim (manual) |
| Headlines | texto de gancho sobre o vídeo | desligado | não |
| Filtro de Tráfego | idioma do navegador, países, dispositivos, chave de URL, token de acesso, bloquear proxy/VPN, vídeo de redirecionamento | desligado | não |
| Botões de ação | botões dentro/fora do vídeo que aparecem em um tempo | desligado | parcial (marcos revelam os botões da página) |
| ThumbSniper | miniaturas alternativas (detalhe não lido) | desligado | não |
| Continuar assistindo | mensagem, botão continuar, botão reiniciar, **mensagem e botão para quem já assistiu até o fim**, cores | ligado (sem a parte "já assistiu") | sim (sem "já assistiu") |
| Mini-Ganchos | textos curtos que aparecem numa faixa de tempo (início–fim) | desligado | não |
| Pixels | eventos de Meta/Google disparados por tempo ou % assistido | desligado | não |
| Legendas | upload de arquivo VTT | desligado | não |
| Opções de Reprodução | ir para o seu elemento (rola até a oferta num tempo), Smart Pause (pausa ao trocar de aba e volta ao retornar), recomeçar após o fim, qualidade inicial (auto/baixa/média/alta) | tudo desligado, qualidade auto | não (qualidade é auto) |
| Experiência Fullscreen | tela cheia própria no desktop/celular, expandir ao tocar, minimizar ao pausar | desligado | não |
| Picture in Picture | mini player flutuante ao rolar a página | desligado | não |

Fora do player, no menu da conta: Testes A/B, Conversões, Segurança.

## Detalhes vistos no código (`smartplayer.js` v4)

- Smart Pause: escuta `visibilitychange`; se a aba some com o vídeo tocando, pausa;
  ao voltar, só retoma se foi ele quem pausou.
- Desativar pause: o comando de pausar é ignorado (exceto quando forçado internamente).
- Ir para o elemento: quando o tempo passa do valor configurado, sai da tela cheia
  e rola a página até o elemento da oferta.
- Recomeçar após o fim: no fim, volta para o início configurado e toca de novo.
- Mini-ganchos: cada item tem `range.start` e `range.finish`; aparece só dentro da faixa.
- Pixels: dispara uma vez por item, por tempo ou porcentagem, para Facebook ou Google (`gtag`).
