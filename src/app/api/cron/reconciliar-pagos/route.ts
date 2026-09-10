import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { reconcilePendingOrders } from '@/lib/order-sync';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

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

  const result = await reconcilePendingOrders(createAdminClient());
  return NextResponse.json(result);
}
