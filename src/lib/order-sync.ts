import { Payment } from 'mercadopago';
import {
  getMercadoPagoClient,
  mapMercadoPagoStatus,
  formatMercadoPagoStatusDetail,
} from '@/lib/mercadopago';
import type { createAdminClient } from '@/lib/supabase/admin';
import { fulfillDigitalOrder } from '@/lib/fulfillment';
import { fulfillOrderBookings } from '@/lib/booking-fulfillment';
import { notifyOrderPaid } from '@/lib/order-notification';
import { applyGiftCardRedemption } from '@/lib/gift-card-redemption';

interface PaymentMetadata {
  gift_card_code?: string;
  gift_card_discount?: number | string;
}

type AdminClient = ReturnType<typeof createAdminClient>;

export interface OrderSyncResult {
  ok: boolean;
  status: 'approved' | 'rejected' | 'pending' | 'not_found';
  message: string;
}

/**
 * Vuelve a preguntarle a Mercado Pago por el pago de un pedido y sincroniza
 * el estado de la orden con lo que MP diga (la confirmación siempre viene de
 * Mercado Pago, nunca se "declara" pagada a mano). Si MP responde "approved",
 * dispara el mismo flujo que el webhook: agenda la(s) cita(s) en Google
 * Calendar, entrega los productos digitales y envía el correo de aviso.
 *
 * Se usa como red de seguridad cuando el webhook no llegó o llegó cuando el
 * pago todavía estaba pendiente.
 */
export async function syncOrderWithMercadoPago(
  supabase: AdminClient,
  orderId: string,
  opts: { confirmedManually?: boolean } = {}
): Promise<OrderSyncResult> {
  const { data: order, error } = await supabase
    .from('orders')
    .select('id, buyer_email, status, notified_at, mp_payment_id')
    .eq('id', orderId)
    .single();
  if (error || !order) {
    return { ok: false, status: 'not_found', message: 'No se encontró el pedido.' };
  }

  const payment = new Payment(getMercadoPagoClient());

  let mpStatus: string | undefined;
  let mpStatusDetail: string | undefined;
  let mpPaymentId: string | undefined = order.mp_payment_id ?? undefined;
  let metadata: PaymentMetadata = {};

  try {
    if (mpPaymentId) {
      const info = await payment.get({ id: mpPaymentId });
      mpStatus = info.status ?? undefined;
      mpStatusDetail = info.status_detail ?? undefined;
      metadata = (info.metadata ?? {}) as PaymentMetadata;
    } else {
      const search = await payment.search({
        options: { external_reference: orderId, sort: 'date_created', criteria: 'desc' },
      });
      const results = search.results ?? [];
      if (results.length === 0) {
        return {
          ok: false,
          status: 'pending',
          message: 'Mercado Pago todavía no tiene ningún pago registrado para este pedido.',
        };
      }
      // Si hay un pago aprobado, ese manda; si no, el más reciente.
      const chosen = results.find((r) => r.status === 'approved') ?? results[0];
      mpStatus = chosen.status ?? undefined;
      mpStatusDetail = chosen.status_detail ?? undefined;
      mpPaymentId = chosen.id != null ? String(chosen.id) : undefined;
    }
  } catch (err) {
    console.error('Error consultando el pago en Mercado Pago', { orderId, err });
    return {
      ok: false,
      status: 'pending',
      message: 'No se pudo consultar el pago en Mercado Pago. Intenta de nuevo en un momento.',
    };
  }

  const mapped = mapMercadoPagoStatus(mpStatus);
  const statusDetail = formatMercadoPagoStatusDetail(mpStatus, mpStatusDetail);
  const wasApproved = order.status === 'approved';

  await supabase
    .from('orders')
    .update({
      status: mapped,
      status_detail: statusDetail,
      ...(mpPaymentId ? { mp_payment_id: mpPaymentId } : {}),
    })
    .eq('id', orderId);

  await fulfillOrderBookings(supabase, orderId, mapped);

  if (mapped !== 'approved') {
    const label = mapped === 'rejected' ? 'rechazado / cancelado' : 'pendiente';
    return {
      ok: true,
      status: mapped,
      message: `Mercado Pago reporta el pago como ${label}${
        statusDetail ? ` (${statusDetail})` : ''
      }. No se agendó ninguna cita.`,
    };
  }

  // Compra con gift card parcial: descuenta el saldo usado (idempotente).
  if (metadata.gift_card_code) {
    const usedAmount = Math.round(Number(metadata.gift_card_discount) || 0);
    if (usedAmount > 0) {
      await applyGiftCardRedemption(supabase, String(metadata.gift_card_code), orderId, usedAmount);
    }
  }

  await fulfillDigitalOrder(supabase, {
    id: order.id,
    buyer_email: order.buyer_email,
    notified_at: order.notified_at,
  });

  if (!wasApproved) {
    await notifyOrderPaid(supabase, orderId, { confirmedManually: opts.confirmedManually });
  }

  return {
    ok: true,
    status: 'approved',
    message: wasApproved
      ? 'Mercado Pago confirma que el pago está aprobado. El pedido ya estaba al día.'
      : 'Pago confirmado por Mercado Pago: pedido aprobado, cita agendada en Google Calendar y correos enviados.',
  };
}

/**
 * Recorre los pedidos que siguen en "pending" y los sincroniza con Mercado
 * Pago. Lo usan el cron de Vercel y también la carga del panel de Pedidos,
 * para que el cambio de estado sea automático sin que nadie tenga que estar
 * pendiente de si la clienta pagó.
 */
export async function reconcilePendingOrders(
  supabase: AdminClient,
  opts: { lookbackDays?: number; limit?: number } = {}
): Promise<{ checked: number; approved: number }> {
  const lookbackDays = opts.lookbackDays ?? 10;
  const limit = opts.limit ?? 50;
  const since = new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000).toISOString();

  const { data: orders, error } = await supabase
    .from('orders')
    .select('id')
    .eq('status', 'pending')
    .gte('created_at', since)
    .limit(limit);

  if (error || !orders || orders.length === 0) {
    if (error) console.error('No se pudieron leer los pedidos pendientes', error);
    return { checked: 0, approved: 0 };
  }

  const results = await Promise.all(
    orders.map((o) =>
      syncOrderWithMercadoPago(supabase, o.id).catch((err) => {
        console.error('Error reconciliando pedido pendiente', { orderId: o.id, err });
        return { ok: false, status: 'pending' as const, message: '' };
      })
    )
  );

  return {
    checked: results.length,
    approved: results.filter((r) => r.status === 'approved').length,
  };
}
