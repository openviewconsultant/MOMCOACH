import { NextResponse } from 'next/server';
import { Preference } from 'mercadopago';
import { getMercadoPagoClient, getSiteUrl, resolveCheckoutUrl } from '@/lib/mercadopago';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSlotStillAvailable, DEFAULT_CALENDAR_ID } from '@/lib/booking-config';
import type { Product } from '@/lib/types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let payload: { productId?: string; name?: string; email?: string; start?: string; end?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida' }, { status: 400 });
  }

  const productId = typeof payload.productId === 'string' ? payload.productId : '';
  const name = typeof payload.name === 'string' ? payload.name.trim() : '';
  const email = typeof payload.email === 'string' ? payload.email.trim() : '';
  const start = typeof payload.start === 'string' ? payload.start : '';
  const end = typeof payload.end === 'string' ? payload.end : '';

  if (!productId) {
    return NextResponse.json({ error: 'Falta el producto' }, { status: 400 });
  }
  if (!name) {
    return NextResponse.json({ error: 'Ingresa tu nombre' }, { status: 400 });
  }
  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: 'Ingresa un correo electrónico válido' }, { status: 400 });
  }
  if (!start || !end || Number.isNaN(new Date(start).getTime()) || Number.isNaN(new Date(end).getTime())) {
    return NextResponse.json({ error: 'Selecciona un horario válido' }, { status: 400 });
  }

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

  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .eq('is_published', true)
    .single();

  if (productError || !product) {
    return NextResponse.json({ error: 'La cita seleccionada ya no está disponible' }, { status: 400 });
  }
  const typedProduct = product as Product;
  if (typedProduct.price <= 0) {
    return NextResponse.json({ error: 'Este producto no requiere pago' }, { status: 400 });
  }

  const calendarId = typedProduct.booking_calendar_id || DEFAULT_CALENDAR_ID;
  const available = await isSlotStillAvailable(calendarId, start, end).catch(() => true);
  if (!available) {
    return NextResponse.json({ error: 'Ese horario ya no está disponible. Por favor elige otro.' }, { status: 409 });
  }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({ buyer_email: email, status: 'pending', total: typedProduct.price })
    .select('id')
    .single();

  if (orderError || !order) {
    console.error('Error creando la orden de la cita en Supabase', orderError);
    return NextResponse.json({ error: 'No se pudo crear la reserva' }, { status: 500 });
  }

  const { error: itemError } = await supabase.from('order_items').insert({
    order_id: order.id,
    product_id: typedProduct.id,
    title: typedProduct.title,
    price: typedProduct.price,
    quantity: 1,
  });
  if (itemError) {
    console.error('Error creando el item de la orden de la cita', itemError);
    return NextResponse.json({ error: 'No se pudo crear la reserva' }, { status: 500 });
  }

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      product_id: typedProduct.id,
      order_id: order.id,
      calendar_id: calendarId,
      buyer_name: name,
      buyer_email: email,
      start_time: start,
      end_time: end,
      status: 'pending',
    })
    .select('id')
    .single();

  if (bookingError || !booking) {
    console.error('Error creando la reserva en Supabase', bookingError);
    return NextResponse.json({ error: 'No se pudo crear la reserva' }, { status: 500 });
  }

  const confirmationUrl = `${siteUrl}/tienda/confirmacion`;

  try {
    const client = getMercadoPagoClient();
    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: [
          {
            id: typedProduct.id,
            title: typedProduct.title,
            quantity: 1,
            currency_id: typedProduct.currency,
            unit_price: typedProduct.price,
            type: 'digital',
          },
        ],
        payer: { email },
        metadata: { order_id: order.id, booking_id: booking.id },
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
    console.error('Error creando preferencia de Mercado Pago para la cita', error);
    return NextResponse.json(
      { error: 'No se pudo iniciar el pago. Intenta nuevamente en unos minutos.' },
      { status: 502 }
    );
  }
}
