import { createClient } from '@/lib/supabase/server';

export interface CalendarOption {
  id: string;
  name: string;
}

export async function getCalendarOptions(): Promise<CalendarOption[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from('site_settings').select('value').eq('key', 'booking_calendars').maybeSingle();
    if (!data?.value) return [{ id: 'default', name: 'General' }];

    const parsed = JSON.parse(data.value);
    if (!Array.isArray(parsed) || parsed.length === 0) return [{ id: 'default', name: 'General' }];

    return parsed.map((c) => ({ id: String(c.id ?? 'default'), name: String(c.name ?? 'Calendario') }));
  } catch {
    return [{ id: 'default', name: 'General' }];
  }
}
