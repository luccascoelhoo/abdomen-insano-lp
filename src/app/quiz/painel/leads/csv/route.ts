import { logado } from '@/lib/quiz-painel';
import { lerLeads } from '@/lib/painel/dados';
import { PERGUNTAS, rotuloDaOpcao } from '@/lib/painel/respostas';
import { dataHora } from '@/lib/painel/tempo';

export const dynamic = 'force-dynamic';

/** Exportação dos leads (sem os de teste), com nota, jornada, origem e respostas legíveis. */
export async function GET(req: Request) {
  if (!(await logado())) return new Response('Não autorizado', { status: 401 });
  const faixa = new URL(req.url).searchParams.get('faixa') ?? 'todas';
  const { leads } = await lerLeads();
  const lista = leads.filter((l) => faixa === 'todas' || l.faixa === faixa);

  const cel = (v: unknown) => {
    const s = String(v ?? '');
    // Fórmula começando por = + - @ vira texto: CSV aberto no Excel não executa nada.
    const seguro = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
    return /[";\r\n]/.test(seguro) ? `"${seguro.replace(/"/g, '""')}"` : seguro;
  };
  const cab = ['cadastro', 'nome', 'email', 'nota', 'faixa', 'nota_regras', 'semelhanca', 'viu_oferta', 'clicou_comprar', 'comprou', 'aceite_email', 'utm_source', 'utm_campaign', 'utm_content', ...PERGUNTAS.map((p) => p.chave)];
  const linhas = lista.map((l) => [
    dataHora(l.criadoEm), l.nome, l.email, l.nota, l.faixa, l.regras.nota, l.semelhanca ?? '',
    l.jornada?.viuOferta ? 'sim' : 'não', l.jornada?.clicouComprar ? 'sim' : 'não', l.comprou ? 'sim' : 'não', l.aceiteEmail ? 'sim' : 'não',
    l.utm.utm_source ?? '', l.utm.utm_campaign ?? '', l.utm.utm_content ?? '',
    ...PERGUNTAS.map((p) => {
      const v = l.respostas[p.chave];
      return v === undefined ? '' : (Array.isArray(v) ? v : [v]).map((x) => rotuloDaOpcao(p.chave, x)).join(', ');
    }),
  ]);
  const corpo = '﻿' + [cab, ...linhas].map((r) => r.map(cel).join(';')).join('\n');
  const dia = new Date().toISOString().slice(0, 10);
  return new Response(corpo, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="leads-quiz-abdomen-insano-${dia}.csv"`,
      'cache-control': 'no-store',
    },
  });
}
