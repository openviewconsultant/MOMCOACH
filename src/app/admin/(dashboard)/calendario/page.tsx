import { createClient } from '@/lib/supabase/server';
import { getCalendarOptions } from '@/lib/calendarOptions';
import type { Booking, Product } from '@/lib/types';
import CalendarSettingsForm from './CalendarSettingsForm';
import CitasTable, { type CitaRow } from './CitasTable';
import CalendarioTabs from './CalendarioTabs';

export default async function CalendarioPage() {
  const supabase = await createClient();

  const [{ data: settingsRows }, calendarOptions, { data: bookingsData }] = await Promise.all([
    supabase.from('site_settings').select('key, value').eq('key', 'booking_calendars'),
    getCalendarOptions(),
    supabase.from('bookings').select('*').order('start_time', { ascending: false }).limit(200),
  ]);

  const settings: Record<string, string> = {};
  (settingsRows || []).forEach((row: { key: string; value: string }) => {
    settings[row.key] = row.value;
  });

  const nameById = new Map(calendarOptions.map((c) => [c.id, c.name]));
  const bookings = (bookingsData || []) as Booking[];

  const productIds = Array.from(new Set(bookings.filter((b) => !b.calendar_id && b.product_id).map((b) => b.product_id as string)));
  const calendarIdByProduct = new Map<string, string>();
  if (productIds.length > 0) {
    const { data: products } = await supabase.from('products').select('id, booking_calendar_id').in('id', productIds);
    (products || []).forEach((p: Pick<Product, 'id' | 'booking_calendar_id'>) => {
      if (p.booking_calendar_id) calendarIdByProduct.set(p.id, p.booking_calendar_id);
    });
  }

  const citas: CitaRow[] = bookings.map((b) => {
    const calendarId = b.calendar_id || (b.product_id ? calendarIdByProduct.get(b.product_id) : undefined) || 'default';
    return { ...b, calendarName: nameById.get(calendarId) ?? 'General' };
  });

  const calendarNames = calendarOptions.map((c) => c.name);

  return (
    <CalendarioTabs
      calendarios={<CalendarSettingsForm initialSettings={settings} />}
      citas={
        <div style={{ maxWidth: 680 }}>
          <CitasTable citas={citas} calendarNames={calendarNames} />
        </div>
      }
    />
  );
}
