import type { createAdminClient } from '@/lib/supabase/admin';
import { sendBookingConfirmationEmail } from '@/lib/email';
import { createCalendarEvent } from '@/lib/google-calendar';
import { getCalendarById, DEFAULT_CALENDAR_ID } from '@/lib/booking-config';
import type { Booking } from '@/lib/types';

type AdminClient = ReturnType<typeof createAdminClient>;

/**
 * Procesa todas las citas (`bookings`) asociadas a una orden según el estado
 * del pago. Una orden puede tener varias citas si el carrito llevaba más de
 * una asesoría. Idempotente: una cita ya confirmada o notificada no se toca.
 *
 *  - `rejected`  → la cita pasa a `cancelled`.
 *  - `approved`  → se crea el evento en Google Calendar y se envía el correo.
 *  - `pending`   → no hace nada (se espera la confirmación del pago).
 */
export async function fulfillOrderBookings(
  supabase: AdminClient,
  orderId: string,
  mappedStatus: 'approved' | 'rejected' | 'pending'
): Promise<void> {
  if (mappedStatus === 'pending') return;

  const { data, error } = await supabase.from('bookings').select('*').eq('order_id', orderId);
  if (error) {
    console.error('No se pudieron consultar las citas de la orden', { orderId, error });
    return;
  }
  const bookings = (data ?? []) as Booking[];
  if (bookings.length === 0) return;

  for (const booking of bookings) {
    await fulfillOneBooking(supabase, booking, mappedStatus);
  }
}

async function fulfillOneBooking(
  supabase: AdminClient,
  booking: Booking,
  mappedStatus: 'approved' | 'rejected'
): Promise<void> {
  if (mappedStatus === 'rejected') {
    if (booking.status !== 'cancelled') {
      await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', booking.id);
    }
    return;
  }

  if (booking.status === 'confirmed' || booking.notified_at) return;

  try {
    let calendarId = DEFAULT_CALENDAR_ID;
    if (booking.product_id) {
      const { data: product } = await supabase
        .from('products')
        .select('booking_calendar_id')
        .eq('id', booking.product_id)
        .maybeSingle();
      calendarId =
        (product as { booking_calendar_id?: string | null } | null)?.booking_calendar_id || DEFAULT_CALENDAR_ID;
    }
    const cal = await getCalendarById(calendarId);

    const event = await createCalendarEvent({
      calendarId: cal.googleCalendarId,
      summary: `Cita con ${booking.buyer_name}`,
      description: `Cita pagada, agendada desde el sitio web de The Mom Coach.\nCorreo: ${booking.buyer_email}`,
      start: new Date(booking.start_time),
      end: new Date(booking.end_time),
      timeZone: cal.timeZone,
      attendeeEmail: booking.buyer_email,
      attendeeName: booking.buyer_name,
    });

    await supabase
      .from('bookings')
      .update({
        status: 'confirmed',
        calendar_event_id: event.eventId,
        meet_link: event.meetLink,
        notified_at: new Date().toISOString(),
      })
      .eq('id', booking.id);

    await sendBookingConfirmationEmail({
      to: booking.buyer_email,
      name: booking.buyer_name,
      start: booking.start_time,
      timeZone: cal.timeZone,
      meetLink: event.meetLink,
      title: 'Tu cita en The Mom Coach',
    });
  } catch (error) {
    console.error('Error confirmando la cita pagada', { bookingId: booking.id, error });
  }
}
