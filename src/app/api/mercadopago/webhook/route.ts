import { NextResponse } from 'next/server';
import { InvalidWebhookSignatureError, Payment, WebhookSignatureValidator } from 'mercadopago';
import { getMercadoPagoClient } from '@/lib/mercadopago';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendPurchaseEmail } from '@/lib/email';
import type { OrderItem } from '@/lib/types';

const DOWNLOAD_LINK_TTL_SECONDS = 60 * 60 * 48; // 48 horas

interface PaymentMetadata {
  order_id?: string;
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

    if (paymentInfo.status !== 'approved') {
      return NextResponse.json({ received: true });
    }

    const metadata = (paymentInfo.metadata ?? {}) as PaymentMetadata;
    const orderId = metadata.order_id ?? paymentInfo.external_reference;
    if (!orderId) {
      console.error('Pago aprobado sin order_id en los metadatos', { dataId });
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

    if (order.status !== 'approved') {
      await supabase
        .from('orders')
        .update({ status: 'approved', mp_payment_id: dataId })
        .eq('id', orderId);
    }

    if (order.notified_at) {
      return NextResponse.json({ received: true });
    }

    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    if (itemsError || !items || items.length === 0) {
      console.error('No se encontraron items para la orden', { orderId, itemsError });
      return NextResponse.json({ received: true });
    }

    const productIds = (items as OrderItem[])
      .map((item) => item.product_id)
      .filter((id): id is string => Boolean(id));

    const { data: products } = await supabase
      .from('products')
      .select('id, file_path')
      .in('id', productIds);

    const filePathByProductId = new Map(
      (products ?? []).map((p: { id: string; file_path: string | null }) => [p.id, p.file_path])
    );

    const downloadItems: { title: string; downloadUrl: string }[] = [];
    for (const item of items as OrderItem[]) {
      const filePath = item.product_id ? filePathByProductId.get(item.product_id) : null;
      if (!filePath) continue;
      const { data: signed, error: signError } = await supabase.storage
        .from('productos')
        .createSignedUrl(filePath, DOWNLOAD_LINK_TTL_SECONDS);
      if (signError || !signed) {
        console.error('Error generando enlace firmado', { filePath, signError });
        continue;
      }
      downloadItems.push({ title: item.title, downloadUrl: signed.signedUrl });
    }

    if (downloadItems.length === 0) {
      console.error('Orden aprobada sin archivos descargables', { orderId });
      return NextResponse.json({ received: true });
    }

    await sendPurchaseEmail({ to: order.buyer_email, items: downloadItems, orderId: order.id });
    await supabase.from('orders').update({ notified_at: new Date().toISOString() }).eq('id', orderId);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error procesando webhook de Mercado Pago', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
