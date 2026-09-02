import { NextResponse } from 'next/server';
import { InvalidWebhookSignatureError, Payment, WebhookSignatureValidator } from 'mercadopago';
import { getMercadoPagoClient } from '@/lib/mercadopago';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendGiftCardEmail } from '@/lib/email';
import { fulfillDigitalOrder } from '@/lib/fulfillment';
import { fulfillOrderBookings } from '@/lib/booking-fulfillment';
import { applyGiftCardRedemption } from '@/lib/gift-card-redemption';
import { GIFT_CARD_PROGRAM_LABEL } from '@/lib/gift-cards';
import type { GiftCard } from '@/lib/types';

interface PaymentMetadata {
  order_id?: string;
  gift_card_id?: string;
  gift_card_code?: string;
  gift_card_discount?: number | string;
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type') ?? url.searchParams.get('topic');
  const dataId = url.searchParams.get('data.id') ?? url.searchParams.get('id');

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
        console.error('Firma de webhook de Mercado Pago inválida', error.reason);
        return NextResponse.json({ error: 'Firma inválida' }, { status: 401 });
      }
      throw error;
    }
  }

  if (type !== 'payment' || !dataId) {
    return NextResponse.json({ received: true });
  }

  try {
    const mpClient = getMercadoPagoClient();
    const payment = new Payment(mpClient);
    const paymentInfo = await payment.get({ id: dataId });

    const metadata = (paymentInfo.metadata ?? {}) as PaymentMetadata;
    const orderId = metadata.order_id ?? paymentInfo.external_reference;
    if (!orderId) {
      console.error('Notificación de pago sin order_id en los metadatos', { dataId });
      return NextResponse.json({ received: true });
    }

    const supabase = createAdminClient();
    const { data: order, error: orderFetchError } = await supabase
      .from('orders')
      .select('id, buyer_email, status, notified_at')
      .eq('id', orderId)
      .single();

    if (orderFetchError || !order) {
      console.error('No se encontró la orden asociada al pago', { orderId, orderFetchError });
      return NextResponse.json({ received: true });
    }

    // Mapea el estado de Mercado Pago al estado que maneja la orden. Los
    // estados terminales negativos (rechazado, cancelado, reembolsado,
    // contracargo) se guardan como "rejected"; todo lo demás (pendiente,
    // en proceso, autorizado, en mediación) se deja como "pending". El
    // detalle real de Mercado Pago siempre se guarda en status_detail para
    // poder mostrarlo en el panel de administración.
    const REJECTED_MP_STATUSES = new Set(['rejected', 'cancelled', 'refunded', 'charged_back']);
    const mappedStatus: 'approved' | 'rejected' | 'pending' =
      paymentInfo.status === 'approved'
        ? 'approved'
        : REJECTED_MP_STATUSES.has(paymentInfo.status ?? '')
          ? 'rejected'
          : 'pending';
    const statusDetail = [paymentInfo.status, paymentInfo.status_detail].filter(Boolean).join(' — ') || null;

    await supabase
      .from('orders')
      .update({ status: mappedStatus, status_detail: statusDetail, mp_payment_id: dataId })
      .eq('id', orderId);

    // Compra de una gift card: al aprobarse se activa y se le envía el
    // código al destinatario; si se rechaza, se cancela.
    if (metadata.gift_card_id) {
      await handleGiftCardPurchase(supabase, metadata.gift_card_id, mappedStatus);
      return NextResponse.json({ received: true });
    }

    // Citas de la orden (si las hay): se confirman o cancelan según el pago.
    // Una orden mixta (libros + asesoría) pasa también por la entrega digital.
    await fulfillOrderBookings(supabase, orderId, mappedStatus);

    if (mappedStatus !== 'approved') {
      return NextResponse.json({ received: true });
    }

    // Compra de tienda con gift card parcial: descuenta el saldo usado.
    if (metadata.gift_card_code) {
      const usedAmount = Math.round(Number(metadata.gift_card_discount) || 0);
      if (usedAmount > 0) {
        await applyGiftCardRedemption(supabase, String(metadata.gift_card_code), orderId, usedAmount);
      }
    }

    await fulfillDigitalOrder(supabase, order);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error procesando webhook de Mercado Pago', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
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
