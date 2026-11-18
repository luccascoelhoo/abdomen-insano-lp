import { chegadaNaMeta, nivelDaCapa, primeiroNome, projecao, travas } from '@/components/quiz/calculos';
import type { Respostas } from '@/components/quiz/tipos';
import { textosCapa } from '@/content/quiz';

/**
 * E-mails do quiz (Plano Capa Zero). Só o que a página já promete: garantia
 * de 15 dias, menos de R$ 2 por dia, 2x na semana, Comunidade Anti Falhas.
 * Projeção sempre dita como estimativa, igual ao diagnóstico.
 */

export const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.abdomeninsano.com.br';

/** Linha de `quiz_respostas` → respostas no formato das telas. */
export function respostasDaLinha(l: {
  nome?: string | null;
  app?: Record<string, unknown> | null;
  extras?: Record<string, unknown> | null;
}): Respostas {
  const app = l.app ?? {};
  const num = (v: unknown) => (typeof v === 'number' ? v : undefined);
  return {
    ...((l.extras ?? {}) as Respostas),
    nome: l.nome ?? (typeof app.name === 'string' ? app.name : undefined),
    altura: num(app.height),
    peso: num(app.weight),
    pesoDesejado: num(app.desired_weight),
    rotina: typeof app.daily_routine === 'string' ? app.daily_routine : undefined,
  };
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const kg = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 1 });

function linkOferta(campanha: string): string {
  return `${BASE}/?utm_source=email&utm_medium=quiz&utm_campaign=${campanha}#oferta`;
}

/* --------------------------------------------------------------- moldura */

function moldura(o: { preheader: string; corpo: string; linkSair?: string | null }): string {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Desafio Abdômen Insano</title></head>
<body style="margin:0;padding:0;background:#f2f2f2;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111">
<span style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(o.preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2f2f2"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden">
<tr><td style="background:#111;padding:18px 24px;color:#fff;font-weight:900;font-size:18px;letter-spacing:.02em">ABDÔMEN <span style="color:#ff6b00">INSANO</span></td></tr>
<tr><td style="padding:28px 24px 8px;font-size:16px;line-height:1.55">${o.corpo}</td></tr>
<tr><td style="padding:8px 24px 28px;font-size:12px;line-height:1.5;color:#777">
Você recebeu este e-mail porque fez o quiz em abdomeninsano.com.br.${
    o.linkSair ? ` <a href="${o.linkSair}" style="color:#777">Não quero mais receber e-mails</a>.` : ''
  }</td></tr>
</table></td></tr></table></body></html>`;
}

function botao(texto: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0"><tr><td style="background:linear-gradient(90deg,#ff6b00,#ff3b30);background-color:#ff6b00;border-radius:999px">
<a href="${href}" style="display:inline-block;padding:15px 28px;color:#111;font-weight:800;font-size:16px;text-decoration:none">${esc(texto)}</a></td></tr></table>`;
}

/* ------------------------------------------------------------ e-mail 1 */

/** Resumo do diagnóstico, logo depois do quiz (é o que a tela promete). */
export function emailPlano(r: Respostas, links: { confirmar: string | null; sair: string | null }) {
  const nome = primeiroNome(r);
  const capa = textosCapa.niveis[nivelDaCapa(r)];
  const p = projecao(r);
  const chegada = chegadaNaMeta(r);
  const minhas = travas(r);

  const projecaoTxt =
    p && p.peso42 < p.pesoAtual
      ? `<b>${kg(p.pesoAtual)} kg → ${kg(p.peso42)} kg</b> em 42 dias, no ritmo de ~${kg(p.ritmoKg)} kg por semana${
          chegada ? `, e a meta de ${kg(p.pesoMeta)} kg em cerca de ${esc(chegada.texto)}` : ''
        }. É uma estimativa: o resultado varia de pessoa pra pessoa.`
      : 'O foco do seu plano é <b>tirar a capa de gordura e construir o abdômen</b>, sem mirar a balança.';

  const travasHtml = minhas.length
    ? `<p style="margin:22px 0 8px;font-weight:900">O que está segurando o seu abdômen</p><ol style="margin:0;padding-left:20px">${minhas
        .map((t) => `<li style="margin:0 0 8px"><b>${esc(t.titulo)}</b>: ${esc(t.texto)}</li>`)
        .join('')}</ol>`
    : '';

  const confirmarHtml = links.confirmar
    ? `<div style="margin:24px 0 0;padding:16px;border:1px solid #ffd2b0;border-radius:12px;background:#fff7f1">
<b>Quer receber dicas e lembretes do desafio?</b><br>Confirme o seu e-mail com um clique. Se não confirmar, você não recebe mais nada além deste.
${botao('Confirmar o meu e-mail', links.confirmar)}</div>`
    : '';

  const corpo = `<p style="margin:0 0 14px;font-size:20px;font-weight:900">${nome ? esc(nome) + ', o' : 'O'} seu Plano Capa Zero está pronto</p>
<p style="margin:0 0 14px">A sua capa de gordura é <b>${esc(capa.rotulo)}</b>. ${capa.texto.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')}</p>
<p style="margin:0 0 14px">${projecaoTxt}</p>
${travasHtml}
<p style="margin:22px 0 0">O Desafio Abdômen Insano ataca tudo isso em 42 dias: alimentação calculada pro seu corpo, treino de abdômen com sobrecarga progressiva (dá resultado com 2x na semana) e a sua evolução registrada no app.</p>
${botao('Começar o meu desafio', linkOferta('plano'))}
<p style="margin:0;font-size:14px;color:#555">Garantia de 15 dias. Use este mesmo e-mail na compra: é com ele que você entra no app.</p>
${confirmarHtml}`;

  const texto = [
    `${nome ? nome + ', o' : 'O'} seu Plano Capa Zero está pronto.`,
    `Capa de gordura: ${capa.rotulo}.`,
    p && p.peso42 < p.pesoAtual ? `Estimativa em 42 dias: ${kg(p.pesoAtual)} kg -> ${kg(p.peso42)} kg.` : '',
    ...minhas.map((t) => `- ${t.titulo}: ${t.texto}`),
    `Começar: ${linkOferta('plano')}`,
    links.confirmar ? `Confirme seu e-mail para receber dicas: ${links.confirmar}` : '',
    links.sair ? `Sair da lista: ${links.sair}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return {
    assunto: `${nome ? nome + ', o' : 'O'} seu Plano Capa Zero está pronto`,
    html: moldura({ preheader: `Capa ${capa.rotulo.toLowerCase()} e o que está segurando o seu abdômen.`, corpo, linkSair: links.sair }),
    texto,
  };
}

/* ------------------------------------------------------- lembretes 1 e 2 */

/** Só para quem confirmou o e-mail e não comprou. Etapa 1: +1 dia; etapa 2: +3 dias. */
export function emailLembrete(etapa: 1 | 2, r: Respostas, linkSair: string) {
  const nome = primeiroNome(r);
  const trava = travas(r)[0];
  const ola = nome ? `${esc(nome)}, ` : '';
  if (etapa === 1) {
    const corpo = `<p style="margin:0 0 14px;font-size:20px;font-weight:900">${ola}o seu plano ainda está te esperando</p>
<p style="margin:0 0 14px">Ontem você montou o seu Plano Capa Zero.${
      trava ? ` A sua maior trava hoje é <b>${esc(trava.titulo.toLowerCase())}</b>, e o plano foi montado pra resolver isso.` : ''
    }</p>
<p style="margin:0 0 14px">São 42 dias, <b>por menos de R$ 2 por dia</b>, com acesso na hora ao app, treino que cabe em 2x na semana e a Comunidade Anti Falhas te puxando nos dias difíceis.</p>
${botao('Quero começar hoje', linkOferta('lembrete1'))}`;
    return {
      assunto: `${nome ? nome + ', o' : 'O'} seu plano ainda está te esperando`,
      html: moldura({ preheader: 'O seu Plano Capa Zero continua pronto.', corpo, linkSair }),
      texto: `${nome ? nome + ', o' : 'O'} seu Plano Capa Zero continua pronto. Começar: ${linkOferta('lembrete1')}\nSair da lista: ${linkSair}`,
    };
  }
  const corpo = `<p style="margin:0 0 14px;font-size:20px;font-weight:900">${ola}o risco é todo meu</p>
<p style="margin:0 0 14px">Se você entrar no desafio, baixar o app, tiver acesso a tudo e mesmo assim não ficar satisfeito, <b>é só pedir o seu dinheiro de volta em até 15 dias</b>.</p>
<p style="margin:0 0 14px">Você não precisa mudar o seu treino todo nem largar o churrasco do fim de semana. Precisa só começar.</p>
${botao('Começar com garantia de 15 dias', linkOferta('lembrete2'))}`;
  return {
    assunto: 'Garantia de 15 dias: o risco é todo meu',
    html: moldura({ preheader: 'Não ficou satisfeito? Devolvo o seu dinheiro.', corpo, linkSair }),
    texto: `Garantia de 15 dias: não ficou satisfeito, devolvo o seu dinheiro. Começar: ${linkOferta('lembrete2')}\nSair da lista: ${linkSair}`,
  };
}
