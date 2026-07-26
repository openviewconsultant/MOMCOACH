import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { Preference } from 'mercadopago';
import { getMercadoPagoClient, getSiteUrl } from '@/lib/mercadopago';
import { getBookById } from '@/lib/books';

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

  const items: {
    id: string;
    title: string;
    quantity: number;
    currency_id: string;
    unit_price: number;
    type: string;
    picture_url?: string;
  }[] = [];

  for (const entry of payload.items) {
    const book = typeof entry?.id === 'string' ? getBookById(entry.id) : undefined;
    const quantity = Number(entry?.quantity);
    if (!book || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      return NextResponse.json(
        { error: 'Uno de los libros del carrito ya no está disponible' },
        { status: 400 }
      );
    }
    items.push({
      id: book.id,
      title: book.title,
      quantity,
      currency_id: 'COP',
      unit_price: book.price,
      type: 'digital',
      picture_url: book.img,
    });
  }

  try {
    const orderId = randomUUID();
    const siteUrl = getSiteUrl();
    const confirmationUrl = `${siteUrl}/tienda/confirmacion`;
    const client = getMercadoPagoClient();
    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items,
        payer: { email },
        metadata: {
          book_ids: items.map((item) => item.id),
          buyer_email: email,
          order_id: orderId,
        },
        external_reference: orderId,
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

    if (!result.init_point) {
      throw new Error('Mercado Pago no devolvió un init_point');
    }

    return NextResponse.json({ initPoint: result.init_point });
  } catch (error) {
    console.error('Error creando preferencia de Mercado Pago', error);
    return NextResponse.json(
      { error: 'No se pudo iniciar el pago. Intenta nuevamente en unos minutos.' },
      { status: 502 }
    );
  }
}
