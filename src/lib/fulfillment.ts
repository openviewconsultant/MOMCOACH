import type { createAdminClient } from '@/lib/supabase/admin';
import { sendPurchaseEmail } from '@/lib/email';
import type { OrderItem } from '@/lib/types';

const DOWNLOAD_LINK_TTL_SECONDS = 60 * 60 * 48; // 48 horas

type AdminClient = ReturnType<typeof createAdminClient>;

/**
 * Entrega de una orden digital ya aprobada: genera enlaces de descarga
 * firmados (48 h) para cada producto con archivo y envía el correo con la
 * plantilla. Idempotente: si la orden ya tiene `notified_at`, no hace nada.
 * La usan tanto el webhook de Mercado Pago como el checkout cuando una gift
 * card cubre el 100% del carrito (no pasa por Mercado Pago).
 */
export async function fulfillDigitalOrder(
  supabase: AdminClient,
  order: { id: string; buyer_email: string; notified_at: string | null }
): Promise<void> {
  if (order.notified_at) return;

  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', order.id);

  if (itemsError || !items || items.length === 0) {
    console.error('No se encontraron items para la orden', { orderId: order.id, itemsError });
    return;
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
    // Normal en órdenes de solo asesoría/cita: no hay nada que descargar,
    // la confirmación la envía el flujo de citas.
    return;
  }

  await sendPurchaseEmail({ to: order.buyer_email, items: downloadItems, orderId: order.id });
  await supabase.from('orders').update({ notified_at: new Date().toISOString() }).eq('id', order.id);
}
