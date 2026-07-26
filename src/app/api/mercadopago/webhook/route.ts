import { NextResponse } from 'next/server';
import { InvalidWebhookSignatureError, Payment, WebhookSignatureValidator } from 'mercadopago';
import { getMercadoPagoClient } from '@/lib/mercadopago';
import { getBookById } from '@/lib/books';
import { sendBookLinksEmail } from '@/lib/email';

interface PaymentMetadata {
  book_ids?: string[];
  buyer_email?: string;
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
    const client = getMercadoPagoClient();
    const payment = new Payment(client);
    const paymentInfo = await payment.get({ id: dataId });

    if (paymentInfo.status !== 'approved') {
      return NextResponse.json({ received: true });
    }

    const metadata = (paymentInfo.metadata ?? {}) as PaymentMetadata;
    const buyerEmail = paymentInfo.payer?.email || metadata.buyer_email;
    const bookIds = metadata.book_ids ?? [];

    if (!buyerEmail || bookIds.length === 0) {
      console.error('Pago aprobado sin correo o libros asociados en los metadatos', {
        dataId,
        metadata,
      });
      return NextResponse.json({ received: true });
    }

    const purchasedBooks = bookIds
      .map((id) => getBookById(id))
      .filter((book): book is NonNullable<typeof book> => Boolean(book));

    if (purchasedBooks.length === 0) {
      console.error('Pago aprobado pero ningún libro coincide con el catálogo actual', {
        dataId,
        bookIds,
      });
      return NextResponse.json({ received: true });
    }

    await sendBookLinksEmail({
      to: buyerEmail,
      books: purchasedBooks.map((book) => ({ title: book.title, driveLink: book.driveLink })),
      orderId: metadata.order_id ?? paymentInfo.external_reference ?? dataId,
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error procesando webhook de Mercado Pago', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
