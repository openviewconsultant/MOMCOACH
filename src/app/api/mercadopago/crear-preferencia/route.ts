import { NextResponse } from 'next/server';
import { Preference } from 'mercadopago';
import { getMercadoPagoClient, getSiteUrl, resolveCheckoutUrl } from '@/lib/mercadopago';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Product } from '@/lib/types';

interface RequestedItem {
  id?: unknown;
  quantity?: unknown;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let payload: { items?: RequestedItem[]; email?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida' }, { status: 400 });
  }

  const email = typeof payload.email === 'string' ? payload.email.trim() : '';
  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: 'Ingresa un correo electrónico válido' }, { status: 400 });
  }

  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    return NextResponse.json({ error: 'El carrito está vacío' }, { status: 400 });
  }

  const requestedQuantities = new Map<string, number>();
  for (const entry of payload.items) {
    const id = typeof entry?.id === 'string' ? entry.id : undefined;
    const quantity = Number(entry?.quantity);
    if (!id || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      return NextResponse.json({ error: 'El carrito contiene datos inválidos' }, { status: 400 });
    }
    requestedQuantities.set(id, quantity);
  }

  // La configuración del servidor (claves de Supabase/Mercado Pago, URL del
  // sitio) se valida aquí, antes de tocar la base de datos, para que un env
  // var faltante en producción devuelva un JSON de error legible en vez de
  // tumbar la función sin respuesta (lo que el cliente ve como "Unexpected
  // end of JSON input") o dejar una orden huérfana a medio crear.
  let supabase: ReturnType<typeof createAdminClient>;
  let siteUrl: string;
  try {
    supabase = createAdminClient();
    siteUrl = getSiteUrl();
  } catch (error) {
    console.error('Configuración del servidor incompleta (Supabase/sitio)', error);
    return NextResponse.json(
      { error: 'El checkout no está disponible en este momento. Intenta más tarde.' },
      { status: 500 }
    );
  }

  const { data: products, error: fetchError } = await supabase
    .from('products')
    .select('*')
    .in('id', Array.from(requestedQuantities.keys()))
    .eq('is_published', true);

  if (fetchError) {
    console.error('Error consultando productos en Supabase', fetchError);
    return NextResponse.json({ error: 'No se pudo validar el carrito' }, { status: 500 });
  }

  const foundProducts = (products ?? []) as Product[];
  if (foundProducts.length !== requestedQuantities.size) {
    return NextResponse.json(
      { error: 'Uno de los productos del carrito ya no está disponible' },
      { status: 400 }
    );
  }

  const paidProducts = foundProducts.filter((p) => p.price > 0);
  if (paidProducts.length !== foundProducts.length) {
    return NextResponse.json(
      { error: 'Los productos gratuitos no pasan por el checkout de pago' },
      { status: 400 }
    );
  }

  const orderItems = foundProducts.map((product) => ({
    product_id: product.id,
    title: product.title,
    price: product.price,
    quantity: requestedQuantities.get(product.id)!,
  }));
  const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({ buyer_email: email, status: 'pending', total })
    .select('id')
    .single();

  if (orderError || !order) {
    console.error('Error creando la orden en Supabase', orderError);
    return NextResponse.json({ error: 'No se pudo crear la orden' }, { status: 500 });
  }

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems.map((item) => ({ ...item, order_id: order.id })));

  if (itemsError) {
    console.error('Error creando los items de la orden en Supabase', itemsError);
    return NextResponse.json({ error: 'No se pudo crear la orden' }, { status: 500 });
  }

  const confirmationUrl = `${siteUrl}/tienda/confirmacion`;

  try {
    const client = getMercadoPagoClient();
    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: foundProducts.map((product) => ({
          id: product.id,
          title: product.title,
          quantity: requestedQuantities.get(product.id)!,
          currency_id: product.currency,
          unit_price: product.price,
          type: 'digital',
          picture_url: product.cover_image_url ?? undefined,
        })),
        payer: { email },
        metadata: { order_id: order.id },
        external_reference: order.id,
        back_urls: {
          success: confirmationUrl,
          pending: confirmationUrl,
          failure: confirmationUrl,
        },
        ...(siteUrl.startsWith('https://') ? { auto_return: 'approved' } : {}),
        notification_url: `${siteUrl}/api/mercadopago/webhook`,
        statement_descriptor: 'THE MOM COACH',
      },
    });

    const checkoutUrl = resolveCheckoutUrl(result);
    if (!checkoutUrl) {
      throw new Error('Mercado Pago no devolvió un init_point');
    }

    return NextResponse.json({ initPoint: checkoutUrl });
  } catch (error) {
    console.error('Error creando preferencia de Mercado Pago', error);
    return NextResponse.json(
      { error: 'No se pudo iniciar el pago. Intenta nuevamente en unos minutos.' },
      { status: 502 }
    );
  }
}
