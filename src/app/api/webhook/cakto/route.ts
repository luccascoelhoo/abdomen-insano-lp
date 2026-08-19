import { NextResponse } from 'next/server';
import { registrarOuAtualizarCompra, type StatusCompra } from '@/lib/compra';

/**
 * Webhook do Cakto (postback).
 *
 * Configuração no painel Cakto → Integrações → Webhook:
 *   URL:  https://SEU_DOMINIO/api/webhook/cakto
 *   Método: POST
 *   Segredo: valor de CAKTO_WEBHOOK_SECRET (variável de ambiente)
 *
 * O Cakto envia o segredo no header `X-Cakto-Signature` (ou `Authorization`,
 * dependendo da versão). A rota rejeita 401 se não bater — nunca grava compra
 * de origem desconhecida.
 *
 * O corpo esperado é o postback padrão. Como o formato exato pode mudar entre
 * versões, o parser é defensivo: aceita várias formas do mesmo campo.
 */
export const runtime = 'nodejs';

type PayloadCakto = {
  event?: string;
  status?: string;
  transaction?: { id?: string; status?: string; amount?: number };
  data?: {
    id?: string;
    status?: string;
    amount?: number;
    customer?: { email?: string; name?: string };
    utm?: Record<string, string>;
  };
  customer?: { email?: string; name?: string };
  email?: string;
  amount?: number;
  id?: string;
  utm?: Record<string, string>;
};

function mapearStatus(bruto: string | undefined): StatusCompra {
  const s = (bruto ?? '').toLowerCase();
  if (['paid', 'approved', 'aprovado', 'aprovada', 'completed', 'success'].includes(s))
    return 'aprovada';
  if (['refunded', 'estornado', 'refund'].includes(s)) return 'estornada';
  if (['chargeback', 'contestado'].includes(s)) return 'chargeback';
  return 'pendente';
}

function centavos(valor: number | undefined): number {
  if (typeof valor !== 'number' || Number.isNaN(valor)) return 0;
  return valor < 1000 ? Math.round(valor * 100) : Math.round(valor);
}

export async function POST(request: Request) {
  const segredo = process.env.CAKTO_WEBHOOK_SECRET;
  if (!segredo) {
    console.error('[webhook/cakto] CAKTO_WEBHOOK_SECRET não configurado');
    return NextResponse.json({ ok: false, motivo: 'nao_configurado' }, { status: 503 });
  }

  const assinaturaHeader =
    request.headers.get('x-cakto-signature') ??
    request.headers.get('x-webhook-secret') ??
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ??
    '';
  if (assinaturaHeader !== segredo) {
    return NextResponse.json({ ok: false, motivo: 'assinatura_invalida' }, { status: 401 });
  }

  let payload: PayloadCakto;
  try {
    payload = (await request.json()) as PayloadCakto;
  } catch {
    return NextResponse.json({ ok: false, motivo: 'json_invalido' }, { status: 400 });
  }

  const email =
    payload.data?.customer?.email ?? payload.customer?.email ?? payload.email ?? '';
  const transacao_id =
    payload.data?.id ?? payload.transaction?.id ?? payload.id ?? '';
  const status = mapearStatus(
    payload.data?.status ?? payload.transaction?.status ?? payload.status ?? payload.event,
  );
  const valor_centavos = centavos(
    payload.data?.amount ?? payload.transaction?.amount ?? payload.amount,
  );
  const utm = payload.data?.utm ?? payload.utm ?? null;

  if (!email || !transacao_id) {
    return NextResponse.json(
      { ok: false, motivo: 'campos_obrigatorios_ausentes' },
      { status: 400 },
    );
  }

  try {
    await registrarOuAtualizarCompra({
      email,
      gateway: 'cakto',
      transacao_id,
      status,
      valor_centavos,
      utm,
    });
    return NextResponse.json({ ok: true });
  } catch (erro) {
    console.error('[webhook/cakto] falha ao gravar compra', erro);
    return NextResponse.json({ ok: false, motivo: 'erro_persistencia' }, { status: 500 });
  }
}
