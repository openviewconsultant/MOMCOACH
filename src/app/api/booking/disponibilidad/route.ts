import { NextResponse } from 'next/server';
import { getAvailableSlots, getCalendarById, DEFAULT_CALENDAR_ID } from '@/lib/booking-config';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const calendarId = url.searchParams.get('calendarId') || DEFAULT_CALENDAR_ID;
    const [slots, cal] = await Promise.all([getAvailableSlots(calendarId), getCalendarById(calendarId)]);
    return NextResponse.json({ slots, timeZone: cal.timeZone, slotMinutes: cal.slotMinutes });
  } catch (error) {
    console.error('Error consultando disponibilidad de Google Calendar', error);
    return NextResponse.json(
      { error: 'No se pudo consultar la disponibilidad en este momento. Intenta más tarde.' },
      { status: 500 }
    );
  }
}
