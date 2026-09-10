import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { syncOrderWithMercadoPago } from '@/lib/order-sync';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Cuántos días hacia atrás se revisan los pedidos que quedaron pendientes.
const LOOKBACK_DAYS = 10;
const MAX_ORDERS = 50;

/**
 * Red de seguridad automática: cada pocos minutos (cron de Vercel) revisa los
 * pedidos que siguen en "pending" y le vuelve a preguntar a Mercado Pago por
 * el pago. Si MP ya lo aprobó, el pedido se agenda y se envían los correos
 * SIN que nadie tenga que tocar un botón — el mismo flujo del webhook.
 *
 * Se protege con CRON_SECRET (Vercel lo manda como `Authorization: Bearer`).
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const since = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const { data: orders, error } = await supabase
    .from('orders')
    .select('id')
    .eq('status', 'pending')
    .gte('created_at', since)
    .limit(MAX_ORDERS);

  if (error) {
    console.error('No se pudieron leer los pedidos pendientes para reconciliar', error);
    return NextResponse.json({ error: 'Error leyendo pedidos' }, { status: 500 });
  }

  const results: { orderId: string; status: string }[] = [];
  for (const order of orders ?? []) {
    try {
      const r = await syncOrderWithMercadoPago(supabase, order.id);
      results.push({ orderId: order.id, status: r.status });
    } catch (err) {
      console.error('Error reconciliando pedido pendiente', { orderId: order.id, err });
      results.push({ orderId: order.id, status: 'error' });
    }
  }

  const approved = results.filter((r) => r.status === 'approved').length;
  return NextResponse.json({ checked: results.length, approved, results });
}
