import { NextResponse, after } from 'next/server';
import { InvalidWebhookSignatureError, MerchantOrder, Payment, WebhookSignatureValidator } from 'mercadopago';
import { getMercadoPagoClient, mapMercadoPagoStatus, formatMercadoPagoStatusDetail } from '@/lib/mercadopago';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendGiftCardEmail } from '@/lib/email';
import { syncOrderWithMercadoPago } from '@/lib/order-sync';
import { GIFT_CARD_PROGRAM_LABEL } from '@/lib/gift-cards';
import type { GiftCard } from '@/lib/types';

interface PaymentMetadata {
  order_id?: string;
  gift_card_id?: string;
}

interface WebhookBody {
  type?: string;
  topic?: string;
  action?: string;
  data?: { id?: string | number };
  id?: string | number;
  resource?: string;
}

export async function POST(request: Request) {
  const url = new URL(request.url);

  // Mercado Pago manda la info a veces en el query string
  // (?type=payment&data.id=123), a veces solo en el cuerpo JSON, y a veces en
  // ambos. Se leen las dos fuentes para no perder ninguna notificación.
  let body: WebhookBody = {};
  try {
    body = (await request.clone().json()) as WebhookBody;
  } catch {
    /* algunas notificaciones vienen sin cuerpo */
  }

  const rawType =
    url.searchParams.get('type') ??
    url.searchParams.get('topic') ??
    body.type ??
    body.topic ??
    (body.action ? body.action.split('.')[0] : null);

  const dataId =
    url.searchParams.get('data.id') ??
    url.searchParams.get('id') ??
    (body.data?.id != null ? String(body.data.id) : null) ??
    (body.id != null ? String(body.id) : null) ??
    (body.resource ? body.resource.split('/').pop() ?? null : null);

  // La firma es una validación extra: si falla (o el secreto de Vercel no
  // coincide con el del panel de Mercado Pago) se registra y se sigue, porque
  // igual se vuelve a consultar el pago contra la API de Mercado Pago con
  // nuestro access token antes de tocar nada.
  const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (webhookSecret) {
    try {
      WebhookSignatureValidator.validate({
        xSignature: request.headers.get('x-signature'),
        xRequestId: request.headers.get('x-request-id'),
        dataId,
        secret: webhookSecret,
        toleranceSeconds: 300,
      });
    } catch (error) {
      if (error instanceof InvalidWebhookSignatureError) {
        console.warn('Firma de webhook de Mercado Pago inválida, se procesa igual', error.reason);
      } else {
        console.warn('No se pudo validar la firma del webhook de Mercado Pago', error);
      }
    }
  }

  // Mercado Pago envía dos tipos de aviso por la misma compra: `payment` y
  // `merchant_order`. Se procesan ambos (idempotentes) para no depender de
  // que llegue uno en concreto.
  if ((rawType !== 'payment' && rawType !== 'merchant_order') || !dataId) {
    return NextResponse.json({ received: true });
  }

  // Se responde 200 de inmediato y el trabajo pesado (consultar el pago,
  // agendar en Google Calendar, enviar correos) corre después de la
  // respuesta. Así Mercado Pago nunca ve el endpoint como lento o caído.
  after(async () => {
    try {
      await processNotification(rawType, dataId);
    } catch (error) {
      console.error('Error procesando webhook de Mercado Pago', { rawType, dataId, error });
    }
  });

  return NextResponse.json({ received: true });
}

async function processNotification(rawType: string, dataId: string): Promise<void> {
  const mpClient = getMercadoPagoClient();
  const supabase = createAdminClient();

  let orderId: string | undefined;

  if (rawType === 'merchant_order') {
    const mo = await new MerchantOrder(mpClient).get({ merchantOrderId: dataId });
    orderId = mo.external_reference ?? undefined;
    if (!orderId) {
      console.error('Merchant order sin external_reference', { dataId });
      return;
    }
    await syncOrderWithMercadoPago(supabase, orderId);
    return;
  }

  // rawType === 'payment'
  const paymentInfo = await new Payment(mpClient).get({ id: dataId });
  const metadata = (paymentInfo.metadata ?? {}) as PaymentMetadata;
  orderId = metadata.order_id ?? paymentInfo.external_reference ?? undefined;
  if (!orderId) {
    console.error('Notificación de pago sin order_id', { dataId });
    return;
  }

  // Compra de una gift card: al aprobarse se activa y se envía el código;
  // si se rechaza, se cancela. (No pasa por el flujo de citas).
  if (metadata.gift_card_id) {
    const mappedStatus = mapMercadoPagoStatus(paymentInfo.status);
    const statusDetail = formatMercadoPagoStatusDetail(paymentInfo.status, paymentInfo.status_detail);
    await supabase
      .from('orders')
      .update({ status: mappedStatus, status_detail: statusDetail, mp_payment_id: dataId })
      .eq('id', orderId);
    await handleGiftCardPurchase(supabase, metadata.gift_card_id, mappedStatus);
    return;
  }

  // Guarda el id de pago para que la sincronización consulte el pago exacto.
  await supabase.from('orders').update({ mp_payment_id: dataId }).eq('id', orderId);
  await syncOrderWithMercadoPago(supabase, orderId);
}

async function handleGiftCardPurchase(
  supabase: ReturnType<typeof createAdminClient>,
  giftCardId: string,
  mappedStatus: 'approved' | 'rejected' | 'pending'
) {
  const { data, error } = await supabase.from('gift_cards').select('*').eq('id', giftCardId).single();
  if (error || !data) {
    console.error('No se encontró la gift card asociada al pago', { giftCardId, error });
    return;
  }
  const card = data as GiftCard;

  if (mappedStatus === 'rejected') {
    if (card.status === 'pending') {
      await supabase.from('gift_cards').update({ status: 'cancelled', updated_at: new Date().toISOString() }).eq('id', giftCardId);
    }
    return;
  }

  if (mappedStatus !== 'approved' || card.status !== 'pending') {
    return; // ya activada o no aprobada aún
  }

  await supabase
    .from('gift_cards')
    .update({ status: 'active', balance: card.initial_amount, updated_at: new Date().toISOString() })
    .eq('id', giftCardId);

  try {
    await sendGiftCardEmail({
      to: card.recipient_email,
      recipientName: card.recipient_name,
      purchaserEmail: card.purchaser_email,
      code: card.code,
      amount: card.initial_amount,
      programLabel: GIFT_CARD_PROGRAM_LABEL[card.program],
      message: card.message,
    });
  } catch (err) {
    console.error('Error enviando el correo de la gift card', { giftCardId, err });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
