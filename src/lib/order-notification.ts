import type { createAdminClient } from '@/lib/supabase/admin';
import { sendOrderPaidEmail } from '@/lib/email';
import { getCalendarById } from '@/lib/booking-config';
import type { Booking, Order, OrderItem } from '@/lib/types';

type AdminClient = ReturnType<typeof createAdminClient>;

/**
 * Dirección donde Denisse recibe los avisos de pago. Configurable con la
 * variable ADMIN_NOTIFICATION_EMAIL; si no está definida, usa su Gmail.
 */
export const ADMIN_NOTIFICATION_EMAIL =
  process.env.ADMIN_NOTIFICATION_EMAIL || 'denisselafaurie00@gmail.com';

function formatAppointmentDate(iso: string, timeZone: string): string {
  return new Date(iso)
    .toLocaleString('es-CO', {
      timeZone,
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
    .replace(/[\xa0 ]/g, ' ');
}

/**
 * Reúne los datos de una orden ya pagada (comprador, celular, programa, cita)
 * y envía el correo de "Pago recibido" a Denisse y a la clienta. Nunca lanza:
 * un fallo de correo no debe tumbar el webhook ni la acción del panel.
 */
export async function notifyOrderPaid(
  supabase: AdminClient,
  orderId: string,
  options: { confirmedManually?: boolean } = {}
): Promise<void> {
  try {
    const { data: orderData } = await supabase
      .from('orders')
      .select('id, buyer_email, total')
      .eq('id', orderId)
      .single();
    if (!orderData) return;
    const order = orderData as Pick<Order, 'id' | 'buyer_email' | 'total'>;

    const { data: itemsData } = await supabase
      .from('order_items')
      .select('title, product_id')
      .eq('order_id', orderId);
    const items = (itemsData ?? []) as Pick<OrderItem, 'title' | 'product_id'>[];

    const { data: bookingsData } = await supabase
      .from('bookings')
      .select('*')
      .eq('order_id', orderId)
      .neq('status', 'cancelled');
    const bookings = (bookingsData ?? []) as Booking[];

    const titleByProduct = new Map<string, string>();
    items.forEach((it) => {
      if (it.product_id) titleByProduct.set(it.product_id, it.title);
    });

    const appointments = [];
    for (const b of bookings) {
      const cal = await getCalendarById(b.calendar_id).catch(() => null);
      const timeZone = cal?.timeZone || 'America/Bogota';
      appointments.push({
        programa:
          (b.product_id ? titleByProduct.get(b.product_id) : undefined) ||
          items[0]?.title ||
          'Asesoría',
        fecha: formatAppointmentDate(b.start_time, timeZone),
        calendario: cal?.name || 'General',
        meetLink: b.meet_link,
      });
    }

    const buyerName = bookings[0]?.buyer_name || null;
    const buyerPhone = bookings.find((b) => b.buyer_phone)?.buyer_phone || null;
    const currency = 'USD';

    await sendOrderPaidEmail({
      to: [ADMIN_NOTIFICATION_EMAIL, order.buyer_email],
      buyerName,
      buyerEmail: order.buyer_email,
      buyerPhone,
      productTitles: items.map((it) => it.title),
      appointments,
      orderId: order.id,
      total: order.total,
      currency,
      confirmedManually: Boolean(options.confirmedManually),
    });

    // El correo salió: marca la orden como notificada para que el panel
    // muestre "Correo enviado: Sí" (fulfillDigitalOrder solo lo hace cuando
    // hay archivos que descargar; una compra de solo cita no los tiene).
    await supabase
      .from('orders')
      .update({ notified_at: new Date().toISOString() })
      .eq('id', orderId)
      .is('notified_at', null);
  } catch (error) {
    console.error('No se pudo enviar el aviso de pago recibido', { orderId, error });
  }
}
