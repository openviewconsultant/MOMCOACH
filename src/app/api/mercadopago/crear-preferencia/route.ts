import { NextResponse } from 'next/server';
import { Preference } from 'mercadopago';
import { getMercadoPagoClient, getSiteUrl, resolveCheckoutUrl } from '@/lib/mercadopago';
import { createAdminClient } from '@/lib/supabase/admin';
import { evaluateGiftCard, applyGiftCardRedemption } from '@/lib/gift-card-redemption';
import { fulfillDigitalOrder } from '@/lib/fulfillment';
import type { Product } from '@/lib/types';

interface RequestedItem {
  id?: unknown;
  quantity?: unknown;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let payload: { items?: RequestedItem[]; email?: string; giftCardCode?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida' }, { status: 400 });
  }

  const email = typeof payload.email === 'string' ? payload.email.trim() : '';
  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: 'Ingresa un correo electrónico válido' }, { status: 400 });
  }
  const giftCardCode = typeof payload.giftCardCode === 'string' ? payload.giftCardCode.trim() : '';

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
  const grossTotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // ── Gift card ───────────────────────────────────────────────────────────
  let discount = 0;
  let normalizedGiftCode: string | null = null;
  if (giftCardCode) {
    const cartItems = foundProducts.map((p) => ({
      productId: p.id,
      quantity: requestedQuantities.get(p.id)!,
      price: p.price,
      category: p.category,
    }));
    const gc = await evaluateGiftCard(supabase, giftCardCode, cartItems);
    if (!gc.ok) {
      return NextResponse.json({ error: gc.error }, { status: gc.status });
    }
    discount = gc.discount;
    normalizedGiftCode = gc.giftCard.code;
  }

  const finalTotal = Math.max(0, grossTotal - discount);

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({ buyer_email: email, status: 'pending', total: finalTotal })
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

  // La gift card cubre el 100%: no hay pago que hacer, se aprueba y entrega ya.
  if (normalizedGiftCode && finalTotal === 0) {
    const applied = await applyGiftCardRedemption(supabase, normalizedGiftCode, order.id, discount);
    if (!applied) {
      return NextResponse.json({ error: 'No se pudo aplicar la gift card. Intenta de nuevo.' }, { status: 500 });
    }
    await supabase
      .from('orders')
      .update({ status: 'approved', status_detail: 'Pagado 100% con gift card' })
      .eq('id', order.id);
    await fulfillDigitalOrder(supabase, { id: order.id, buyer_email: email, notified_at: null });
    return NextResponse.json({ initPoint: `${siteUrl}/tienda/confirmacion?status=approved`, fullyCovered: true });
  }

  const confirmationUrl = `${siteUrl}/tienda/confirmacion`;

  try {
    const client = getMercadoPagoClient();
    const preference = new Preference(client);

    // Sin gift card: se envían los items reales. Con gift card parcial: se
    // colapsa en un único item por el total ya descontado (Mercado Pago no
    // admite descuentos ni precios negativos por línea).
    const mpItems = normalizedGiftCode
      ? [
          {
            id: order.id,
            title: 'Compra en The Mom Coach',
            quantity: 1,
            currency_id: 'USD',
            unit_price: finalTotal,
            type: 'digital' as const,
          },
        ]
      : foundProducts.map((product) => ({
          id: product.id,
          title: product.title,
          quantity: requestedQuantities.get(product.id)!,
          currency_id: product.currency,
          unit_price: product.price,
          type: 'digital' as const,
          picture_url: product.cover_image_url ?? undefined,
        }));

    const result = await preference.create({
      body: {
        items: mpItems,
        payer: { email },
        metadata: {
          order_id: order.id,
          ...(normalizedGiftCode ? { gift_card_code: normalizedGiftCode, gift_card_discount: discount } : {}),
        },
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
