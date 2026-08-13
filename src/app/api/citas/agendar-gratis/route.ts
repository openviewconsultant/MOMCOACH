import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createCalendarEvent } from '@/lib/google-calendar';
import { isSlotStillAvailable, getCalendarById, DEFAULT_CALENDAR_ID } from '@/lib/booking-config';
import { sendBookingConfirmationEmail } from '@/lib/email';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let payload: { name?: string; email?: string; start?: string; end?: string; calendarId?: string; productId?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida' }, { status: 400 });
  }

  const name = typeof payload.name === 'string' ? payload.name.trim() : '';
  const email = typeof payload.email === 'string' ? payload.email.trim() : '';
  const start = typeof payload.start === 'string' ? payload.start : '';
  const end = typeof payload.end === 'string' ? payload.end : '';
  const calendarId = typeof payload.calendarId === 'string' && payload.calendarId ? payload.calendarId : DEFAULT_CALENDAR_ID;
  const productId = typeof payload.productId === 'string' && payload.productId ? payload.productId : null;

  if (!name) {
    return NextResponse.json({ error: 'Ingresa tu nombre' }, { status: 400 });
  }
  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: 'Ingresa un correo electrónico válido' }, { status: 400 });
  }
  if (!start || !end || Number.isNaN(new Date(start).getTime()) || Number.isNaN(new Date(end).getTime())) {
    return NextResponse.json({ error: 'Selecciona un horario válido' }, { status: 400 });
  }

  try {
    const cal = await getCalendarById(calendarId);
    const available = await isSlotStillAvailable(calendarId, start, end);
    if (!available) {
      return NextResponse.json(
        { error: 'Ese horario ya no está disponible. Por favor elige otro.' },
        { status: 409 }
      );
    }

    const supabase = createAdminClient();
    const { data: booking, error: insertError } = await supabase
      .from('bookings')
      .insert({
        product_id: productId,
        buyer_name: name,
        buyer_email: email,
        start_time: start,
        end_time: end,
        status: 'confirmed',
      })
      .select('id')
      .single();

    if (insertError || !booking) {
      console.error('Error creando la reserva gratuita en Supabase', insertError);
      return NextResponse.json({ error: 'No se pudo agendar la cita' }, { status: 500 });
    }

    const event = await createCalendarEvent({
      calendarId: cal.googleCalendarId,
      summary: `Llamada de descubrimiento con ${name}`,
      description: `Llamada gratuita de descubrimiento agendada desde el sitio web de The Mom Coach.\nCorreo: ${email}`,
      start: new Date(start),
      end: new Date(end),
      timeZone: cal.timeZone,
      attendeeEmail: email,
      attendeeName: name,
    });

    await supabase
      .from('bookings')
      .update({ calendar_event_id: event.eventId, meet_link: event.meetLink })
      .eq('id', booking.id);

    // La cita ya quedó agendada en Calendar en este punto. Si el correo de
    // confirmación falla (ej. Gmail mal configurado), no se debe reportar la
    // reserva como fallida al usuario — solo queda sin notificar por correo.
    try {
      await sendBookingConfirmationEmail({
        to: email,
        name,
        start,
        timeZone: cal.timeZone,
        meetLink: event.meetLink,
        title: 'Llamada de descubrimiento',
      });
      await supabase.from('bookings').update({ notified_at: new Date().toISOString() }).eq('id', booking.id);
    } catch (emailError) {
      console.error('La cita quedó agendada pero no se pudo enviar el correo de confirmación', emailError);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error agendando la llamada gratuita', error);
    return NextResponse.json(
      { error: 'No se pudo agendar la cita en este momento. Intenta más tarde.' },
      { status: 500 }
    );
  }
}
