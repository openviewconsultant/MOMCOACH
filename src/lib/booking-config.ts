import { getBusyIntervals } from './google-calendar';
import { createAdminClient } from './supabase/admin';

export const DEFAULT_CALENDAR_ID = 'default';

export interface NamedCalendar {
  id: string; // slug interno, ej. "default", "sueno", "alimentacion"
  name: string;
  googleCalendarId: string;
  timeZone: string;
  slotMinutes: number;
  dayStartHour: number;
  dayEndHour: number;
  workingDays: number[]; // 0=Domingo ... 6=Sábado
  advanceDays: number;
  minNoticeHours: number;
  blockedDates: string[]; // ISO "YYYY-MM-DD" (bloquea el día completo)
  blockedRanges: BlockedRange[]; // bloquea solo una franja horaria de un día
}

export interface BlockedRange {
  date: string; // ISO "YYYY-MM-DD"
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
}

const FALLBACK_CALENDAR: NamedCalendar = {
  id: DEFAULT_CALENDAR_ID,
  name: 'General',
  googleCalendarId: process.env.GOOGLE_CALENDAR_ID || '',
  timeZone: process.env.BOOKING_TIMEZONE || 'America/Bogota',
  slotMinutes: Number(process.env.BOOKING_SLOT_MINUTES) || 30,
  dayStartHour: Number(process.env.BOOKING_DAY_START_HOUR) || 8,
  dayEndHour: Number(process.env.BOOKING_DAY_END_HOUR) || 19,
  workingDays: (process.env.BOOKING_WORKING_DAYS || '1,2,3,4,5,6').split(',').map((d) => Number(d.trim())),
  advanceDays: Number(process.env.BOOKING_ADVANCE_DAYS) || 21,
  minNoticeHours: Number(process.env.BOOKING_MIN_NOTICE_HOURS) || 12,
  blockedDates: [],
  blockedRanges: [],
};

export const BOOKING_TIMEZONE = FALLBACK_CALENDAR.timeZone;

/**
 * Lee la lista de calendarios (uno por servicio) configurados desde el panel
 * de administración → Calendario. Si todavía no se ha guardado nada, se usa
 * un único calendario "General" armado con las variables de entorno, para
 * que el sitio siga funcionando mientras no se hayan creado calendarios.
 */
export async function getCalendars(): Promise<NamedCalendar[]> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase.from('site_settings').select('value').eq('key', 'booking_calendars').maybeSingle();
    if (!data?.value) return [FALLBACK_CALENDAR];

    const parsed = JSON.parse(data.value);
    if (!Array.isArray(parsed) || parsed.length === 0) return [FALLBACK_CALENDAR];

    return parsed.map((c): NamedCalendar => ({
      id: String(c.id ?? DEFAULT_CALENDAR_ID),
      name: String(c.name ?? 'Calendario'),
      googleCalendarId: String(c.googleCalendarId ?? ''),
      timeZone: String(c.timeZone || FALLBACK_CALENDAR.timeZone),
      slotMinutes: Number(c.slotMinutes) > 0 ? Number(c.slotMinutes) : FALLBACK_CALENDAR.slotMinutes,
      dayStartHour: Number.isFinite(Number(c.dayStartHour)) ? Number(c.dayStartHour) : FALLBACK_CALENDAR.dayStartHour,
      dayEndHour: Number.isFinite(Number(c.dayEndHour)) ? Number(c.dayEndHour) : FALLBACK_CALENDAR.dayEndHour,
      workingDays: Array.isArray(c.workingDays) && c.workingDays.length > 0 ? c.workingDays.map(Number) : FALLBACK_CALENDAR.workingDays,
      advanceDays: Number(c.advanceDays) > 0 ? Number(c.advanceDays) : FALLBACK_CALENDAR.advanceDays,
      minNoticeHours: Number.isFinite(Number(c.minNoticeHours)) ? Number(c.minNoticeHours) : FALLBACK_CALENDAR.minNoticeHours,
      blockedDates: Array.isArray(c.blockedDates) ? c.blockedDates.filter((d: unknown) => typeof d === 'string') : [],
      blockedRanges: Array.isArray(c.blockedRanges)
        ? c.blockedRanges.filter(
            (r: unknown): r is BlockedRange =>
              !!r && typeof r === 'object' &&
              typeof (r as BlockedRange).date === 'string' &&
              typeof (r as BlockedRange).startTime === 'string' &&
              typeof (r as BlockedRange).endTime === 'string'
          )
        : [],
    }));
  } catch (error) {
    console.error('No se pudo leer la lista de calendarios desde Supabase, usando el calendario por defecto', error);
    return [FALLBACK_CALENDAR];
  }
}

export async function getCalendarById(calendarId: string | null | undefined): Promise<NamedCalendar> {
  const calendars = await getCalendars();
  return calendars.find((c) => c.id === calendarId) ?? calendars[0] ?? FALLBACK_CALENDAR;
}

export interface Slot {
  start: string; // ISO
  end: string; // ISO
}

function getOffsetMinutesForTimeZone(date: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
  const parts = dtf.formatToParts(date).reduce<Record<string, string>>((acc, p) => {
    acc[p.type] = p.value;
    return acc;
  }, {});
  const asUTC = Date.UTC(
    Number(parts.year), Number(parts.month) - 1, Number(parts.day),
    Number(parts.hour), Number(parts.minute), Number(parts.second)
  );
  return (asUTC - date.getTime()) / 60000;
}

// Construye una fecha UTC a partir de un día/hora "de reloj" en la zona horaria del negocio.
function zonedTimeToUtc(year: number, month: number, day: number, hour: number, minute: number, timeZone: string): Date {
  const utcGuess = new Date(Date.UTC(year, month, day, hour, minute));
  const offsetMinutes = getOffsetMinutesForTimeZone(utcGuess, timeZone);
  return new Date(utcGuess.getTime() - offsetMinutes * 60000);
}

// Convierte las franjas bloqueadas (fecha + "HH:MM" en la zona horaria del
// calendario) a rangos de tiempo absolutos (ms desde epoch) para poder
// compararlas contra los slots candidatos.
function resolveBlockedRanges(ranges: BlockedRange[], timeZone: string): { start: number; end: number }[] {
  return ranges
    .map((r) => {
      const [y, m, d] = r.date.split('-').map(Number);
      const [sh, sm] = r.startTime.split(':').map(Number);
      const [eh, em] = r.endTime.split(':').map(Number);
      if (!y || !m || !d || Number.isNaN(sh) || Number.isNaN(sm) || Number.isNaN(eh) || Number.isNaN(em)) return null;
      const start = zonedTimeToUtc(y, m - 1, d, sh, sm, timeZone).getTime();
      const end = zonedTimeToUtc(y, m - 1, d, eh, em, timeZone).getTime();
      return start < end ? { start, end } : null;
    })
    .filter((r): r is { start: number; end: number } => r !== null);
}

// Franjas que ya tienen una reserva "activa" en Supabase (pagada, o con un
// pago en curso en los últimos MINUTOS_RESERVA_TEMPORAL minutos), para que
// no se le siga ofreciendo a otras personas el mismo horario mientras el
// primer comprador todavía no termina de pagar (el evento real en Google
// Calendar solo se crea cuando el webhook de Mercado Pago confirma el pago).
const PENDING_HOLD_MINUTES = 30;

async function getActiveBookingRanges(calendarId: string): Promise<{ start: number; end: number }[]> {
  try {
    const supabase = createAdminClient();
    const holdCutoff = new Date(Date.now() - PENDING_HOLD_MINUTES * 60 * 1000).toISOString();
    const { data } = await supabase
      .from('bookings')
      .select('start_time, end_time, status, created_at')
      .eq('calendar_id', calendarId)
      .in('status', ['pending', 'confirmed']);

    return (data ?? [])
      .filter((b) => b.status === 'confirmed' || b.created_at >= holdCutoff)
      .map((b) => ({ start: new Date(b.start_time).getTime(), end: new Date(b.end_time).getTime() }));
  } catch (error) {
    console.error('No se pudieron leer las reservas activas desde Supabase', error);
    return [];
  }
}

/**
 * Genera las franjas disponibles del calendario indicado para los próximos
 * "advanceDays" días, dentro de su horario de atención, excluyendo lo que ya
 * está ocupado en su Google Calendar real, lo que ya tiene una reserva
 * activa en Supabase, y los días bloqueados manualmente.
 */
export async function getAvailableSlots(calendarId: string): Promise<Slot[]> {
  const cal = await getCalendarById(calendarId);
  if (!cal.googleCalendarId) return [];

  const now = new Date();
  const rangeStart = new Date(now.getTime());
  const rangeEnd = new Date(now.getTime() + cal.advanceDays * 24 * 60 * 60 * 1000);

  const [busy, activeBookingRanges] = await Promise.all([
    getBusyIntervals(rangeStart, rangeEnd, cal.googleCalendarId),
    getActiveBookingRanges(cal.id),
  ]);
  const busyRanges = [
    ...busy.map((b) => ({ start: new Date(b.start).getTime(), end: new Date(b.end).getTime() })),
    ...activeBookingRanges,
  ];
  const blockedSet = new Set(cal.blockedDates);
  const blockedRanges = resolveBlockedRanges(cal.blockedRanges, cal.timeZone);

  const minStart = now.getTime() + cal.minNoticeHours * 60 * 60 * 1000;
  const slots: Slot[] = [];

  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: cal.timeZone,
    year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short',
  });

  for (let dayOffset = 0; dayOffset <= cal.advanceDays; dayOffset++) {
    const probe = new Date(now.getTime() + dayOffset * 24 * 60 * 60 * 1000);
    const parts = fmt.formatToParts(probe).reduce<Record<string, string>>((acc, p) => {
      acc[p.type] = p.value;
      return acc;
    }, {});
    const year = Number(parts.year);
    const month = Number(parts.month) - 1;
    const day = Number(parts.day);
    const weekdayIndex = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday);
    const isoDate = `${parts.year}-${parts.month}-${parts.day}`;

    if (!cal.workingDays.includes(weekdayIndex)) continue;
    if (blockedSet.has(isoDate)) continue;

    for (let minutes = cal.dayStartHour * 60; minutes < cal.dayEndHour * 60; minutes += cal.slotMinutes) {
      const hour = Math.floor(minutes / 60);
      const minute = minutes % 60;
      const slotStart = zonedTimeToUtc(year, month, day, hour, minute, cal.timeZone);
      const slotEnd = new Date(slotStart.getTime() + cal.slotMinutes * 60000);

      if (slotStart.getTime() < minStart) continue;

      const overlapsBusy = busyRanges.some(
        (b) => slotStart.getTime() < b.end && slotEnd.getTime() > b.start
      );
      if (overlapsBusy) continue;

      const overlapsBlockedRange = blockedRanges.some(
        (b) => slotStart.getTime() < b.end && slotEnd.getTime() > b.start
      );
      if (overlapsBlockedRange) continue;

      slots.push({ start: slotStart.toISOString(), end: slotEnd.toISOString() });
    }
  }

  return slots;
}

export async function isSlotStillAvailable(calendarId: string, startIso: string, endIso: string): Promise<boolean> {
  const cal = await getCalendarById(calendarId);
  if (!cal.googleCalendarId) return false;

  const start = new Date(startIso);
  const end = new Date(endIso);

  const isoDate = new Intl.DateTimeFormat('en-CA', { timeZone: cal.timeZone }).format(start);
  if (cal.blockedDates.includes(isoDate)) return false;

  const blockedRanges = resolveBlockedRanges(cal.blockedRanges, cal.timeZone);
  const overlapsBlockedRange = blockedRanges.some(
    (b) => start.getTime() < b.end && end.getTime() > b.start
  );
  if (overlapsBlockedRange) return false;

  const activeBookingRanges = await getActiveBookingRanges(cal.id);
  const overlapsActiveBooking = activeBookingRanges.some(
    (b) => start.getTime() < b.end && end.getTime() > b.start
  );
  if (overlapsActiveBooking) return false;

  const busy = await getBusyIntervals(start, end, cal.googleCalendarId);
  return !busy.some((b) => start.getTime() < new Date(b.end).getTime() && end.getTime() > new Date(b.start).getTime());
}
