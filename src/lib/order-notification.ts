import type { createAdminClient } from '@/lib/supabase/admin';
import { sendOrderPaidEmail, sendAdminOrderStatusEmail, type OrderPaidAppointment } from '@/lib/email';
import { getCalendarById } from '@/lib/booking-config';
import { friendlyStatusDetail } from '@/lib/mp-status-detail';
import type { Booking, Order, OrderItem } from '@/lib/types';

type AdminClient = ReturnType<typeof createAdminClient>;

interface OrderSummary {
  order: Pick<Order, 'id' | 'buyer_email' | 'total'>;
  productTitles: string[];
  appointments: OrderPaidAppointment[];
  buyerName: string | null;
  buyerPhone: string | null;
}

/** Reúne comprador, celular, programa y cita(s) de una orden para los correos. */
async function gatherOrderSummary(supabase: AdminClient, orderId: string): Promise<OrderSummary | null> {
  const { data: orderData } = await supabase
    .from('orders')
    .select('id, buyer_email, total')
    .eq('id', orderId)
    .single();
  if (!orderData) return null;
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

  const appointments: OrderPaidAppointment[] = [];
  for (const b of bookings) {
    const cal = await getCalendarById(b.calendar_id).catch(() => null);
    const timeZone = cal?.timeZone || 'America/Bogota';
    appointments.push({
      programa: (b.product_id ? titleByProduct.get(b.product_id) : undefined) || items[0]?.title || 'Asesoría',
      fecha: formatAppointmentDate(b.start_time, timeZone),
      calendario: cal?.name || 'General',
      meetLink: b.meet_link,
    });
  }

  return {
    order,
    productTitles: items.map((it) => it.title),
    appointments,
    buyerName: bookings[0]?.buyer_name || null,
    buyerPhone: bookings.find((b) => b.buyer_phone)?.buyer_phone || null,
  };
}

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
    const summary = await gatherOrderSummary(supabase, orderId);
    if (!summary) return;

    await sendOrderPaidEmail({
      to: [ADMIN_NOTIFICATION_EMAIL, summary.order.buyer_email],
      buyerName: summary.buyerName,
      buyerEmail: summary.order.buyer_email,
      buyerPhone: summary.buyerPhone,
      productTitles: summary.productTitles,
      appointments: summary.appointments,
      orderId: summary.order.id,
      total: summary.order.total,
      currency: 'USD',
      confirmedManually: Boolean(options.confirmedManually),
    });

    // El correo salió: marca la orden como notificada para que el panel
    // muestre "Correo enviado: Sí" (fulfillDigitalOrder solo lo hace cuando
    // hay archivos que descargar; una compra de solo cita no los tiene).
    await supabase
      .from('orders')
      .update({ notified_at: new Date().toISOString(), admin_notified_status: 'approved' })
      .eq('id', orderId)
      .is('notified_at', null);
  } catch (error) {
    console.error('No se pudo enviar el aviso de pago recibido', { orderId, error });
  }
}

/**
 * Avisa SOLO a Denisse cuando una orden queda pendiente o rechazada, con los
 * datos de contacto para hacer seguimiento. Se envía una vez por cada estado
 * (no se repite si el cron/panel vuelve a revisar la misma orden pendiente).
 */
export async function notifyAdminOrderStatus(
  supabase: AdminClient,
  orderId: string,
  state: 'pending' | 'rejected',
  rawStatusDetail: string | null
): Promise<void> {
  try {
    const { data: row } = await supabase
      .from('orders')
      .select('admin_notified_status')
      .eq('id', orderId)
      .maybeSingle();
    if ((row as { admin_notified_status?: string | null } | null)?.admin_notified_status === state) {
      return; // ya se avisó de este estado
    }

    const summary = await gatherOrderSummary(supabase, orderId);
    if (!summary) return;

    await sendAdminOrderStatusEmail({
      to: [ADMIN_NOTIFICATION_EMAIL],
      state,
      reason: friendlyStatusDetail(rawStatusDetail),
      buyerName: summary.buyerName,
      buyerEmail: summary.order.buyer_email,
      buyerPhone: summary.buyerPhone,
      productTitles: summary.productTitles,
      appointments: summary.appointments,
      orderId: summary.order.id,
      total: summary.order.total,
      currency: 'USD',
    });

    await supabase.from('orders').update({ admin_notified_status: state }).eq('id', orderId);
  } catch (error) {
    console.error('No se pudo enviar el aviso de estado del pago a Denisse', { orderId, state, error });
  }
}
