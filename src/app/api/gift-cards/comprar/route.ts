import { NextResponse } from 'next/server';
import { Preference } from 'mercadopago';
import { getMercadoPagoClient, getSiteUrl, resolveCheckoutUrl } from '@/lib/mercadopago';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateGiftCardCode, GIFT_CARD_PROGRAM_LABEL } from '@/lib/gift-cards';
import type { Product, GiftCardProgram } from '@/lib/types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let payload: {
    productId?: string;
    amount?: unknown;
    purchaserEmail?: string;
    recipientEmail?: string;
    recipientName?: string;
    message?: string;
  };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida' }, { status: 400 });
  }

  const productId = typeof payload.productId === 'string' ? payload.productId : '';
  const amount = Math.round(Number(payload.amount));
  const purchaserEmail = typeof payload.purchaserEmail === 'string' ? payload.purchaserEmail.trim() : '';
  const recipientEmail = typeof payload.recipientEmail === 'string' ? payload.recipientEmail.trim() : '';
  const recipientName = typeof payload.recipientName === 'string' ? payload.recipientName.trim().slice(0, 120) : '';
  const message = typeof payload.message === 'string' ? payload.message.trim().slice(0, 500) : '';

  if (!productId) return NextResponse.json({ error: 'Falta la gift card' }, { status: 400 });
  if (!Number.isInteger(amount) || amount <= 0) {
    return NextResponse.json({ error: 'Ingresa un monto válido (en dólares enteros)' }, { status: 400 });
  }
  if (!EMAIL_REGEX.test(purchaserEmail)) {
    return NextResponse.json({ error: 'Ingresa tu correo electrónico' }, { status: 400 });
  }
  if (!EMAIL_REGEX.test(recipientEmail)) {
    return NextResponse.json({ error: 'Ingresa el correo de quien recibe el regalo' }, { status: 400 });
  }

  let supabase: ReturnType<typeof createAdminClient>;
  let siteUrl: string;
  try {
    supabase = createAdminClient();
    siteUrl = getSiteUrl();
  } catch (error) {
    console.error('Configuración del servidor incompleta (Supabase/sitio)', error);
    return NextResponse.json({ error: 'El checkout no está disponible en este momento. Intenta más tarde.' }, { status: 500 });
  }

  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .eq('is_published', true)
    .maybeSingle();

  const p = product as Product | null;
  if (productError || !p || !p.gift_card_program) {
    return NextResponse.json({ error: 'Esa gift card ya no está disponible' }, { status: 400 });
  }
  const program = p.gift_card_program as GiftCardProgram;
  const programLabel = GIFT_CARD_PROGRAM_LABEL[program];
  const giftTitle = `Gift Card — ${programLabel} (USD $${amount})`;

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({ buyer_email: purchaserEmail, status: 'pending', total: amount })
    .select('id')
    .single();
  if (orderError || !order) {
    console.error('Error creando la orden de la gift card', orderError);
    return NextResponse.json({ error: 'No se pudo crear la orden' }, { status: 500 });
  }

  const { error: itemError } = await supabase.from('order_items').insert({
    order_id: order.id,
    product_id: p.id,
    title: giftTitle,
    price: amount,
    quantity: 1,
  });
  if (itemError) {
    console.error('Error creando el item de la gift card', itemError);
    return NextResponse.json({ error: 'No se pudo crear la orden' }, { status: 500 });
  }

  const { data: giftCard, error: gcError } = await supabase
    .from('gift_cards')
    .insert({
      code: generateGiftCardCode(),
      program,
      initial_amount: amount,
      balance: 0,
      purchaser_email: purchaserEmail,
      recipient_email: recipientEmail,
      recipient_name: recipientName || null,
      message: message || null,
      order_id: order.id,
      status: 'pending',
    })
    .select('id')
    .single();
  if (gcError || !giftCard) {
    console.error('Error creando la gift card', gcError);
    return NextResponse.json({ error: 'No se pudo crear la gift card' }, { status: 500 });
  }

  const confirmationUrl = `${siteUrl}/tienda/confirmacion`;
  try {
    const client = getMercadoPagoClient();
    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: [
          {
            id: p.id,
            title: giftTitle,
            quantity: 1,
            currency_id: p.currency || 'USD',
            unit_price: amount,
            type: 'digital',
          },
        ],
        payer: { email: purchaserEmail },
        metadata: { order_id: order.id, gift_card_id: giftCard.id },
        external_reference: order.id,
        back_urls: { success: confirmationUrl, pending: confirmationUrl, failure: confirmationUrl },
        ...(siteUrl.startsWith('https://') ? { auto_return: 'approved' as const } : {}),
        notification_url: `${siteUrl}/api/mercadopago/webhook`,
        statement_descriptor: 'THE MOM COACH',
      },
    });
    const checkoutUrl = resolveCheckoutUrl(result);
    if (!checkoutUrl) throw new Error('Mercado Pago no devolvió un init_point');
    return NextResponse.json({ initPoint: checkoutUrl });
  } catch (error) {
    console.error('Error creando preferencia de Mercado Pago para la gift card', error);
    return NextResponse.json(
      { error: 'No se pudo iniciar el pago. Intenta nuevamente en unos minutos.' },
      { status: 502 }
    );
  }
}
