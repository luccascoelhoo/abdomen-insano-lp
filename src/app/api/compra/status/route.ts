import { NextResponse } from 'next/server';
import { buscarCompraPorTransacao } from '@/lib/compra';
import { supabaseConfigured } from '@/lib/supabase';
import { eventIdDaTransacao } from '@/lib/transacao';

/**
 * "O servidor já sabe desta venda, e com que `event_id` ele a registrou?"
 *
 * Existe para tirar do navegador a decisão de inventar o id do `Purchase`. A
 * página de obrigado lê o identificador que o gateway pôs na URL de retorno; o
 * webhook lê o que o gateway pôs no corpo do postback. Se os dois campos não
 * forem o mesmo valor, cada lado dispara um id diferente e a mesma venda é
 * contada duas vezes.
 *
 * Aqui o servidor responde qual id **ele** usou. O navegador só dispara com
 * esse, e a deduplicação deixa de depender de o gateway ser coerente consigo
 * mesmo.
 *
 * Não devolve nada sobre a pessoa: só se a venda existe, se está aprovada, o
 * valor em centavos e o id do evento. Quem tem o id da transação já o tinha.
 */
export const runtime = 'nodejs';

export async function POST(request: Request) {
  if (!supabaseConfigured()) {
    return NextResponse.json({ ok: false, motivo: 'backend_nao_configurado' }, { status: 503 });
  }

  let body: { transacao_id?: string };
  try {
    body = (await request.json()) as { transacao_id?: string };
  } catch {
    return NextResponse.json({ ok: false, motivo: 'json_invalido' }, { status: 400 });
  }

  const transacao = (body.transacao_id ?? '').trim();
  if (!transacao || transacao.length > 128) {
    return NextResponse.json({ ok: false, motivo: 'transacao_invalida' }, { status: 400 });
  }

  try {
    const compra = await buscarCompraPorTransacao('cakto', transacao);
    if (!compra) {
      // Ainda não chegou postback para esta transação. O navegador tenta de novo.
      return NextResponse.json({ ok: true, conhecida: false });
    }
    return NextResponse.json({
      ok: true,
      conhecida: true,
      aprovada: compra.status === 'aprovada',
      valor: compra.valor_centavos / 100,
      event_id: eventIdDaTransacao(compra.transacao_id),
    });
  } catch (erro) {
    console.error('[compra/status] falha', erro);
    return NextResponse.json({ ok: false, motivo: 'erro_consulta' }, { status: 500 });
  }
}
