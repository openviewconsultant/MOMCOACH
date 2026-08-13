import { createClient } from '@/lib/supabase/server';
import CalendarSettingsForm from './CalendarSettingsForm';

export default async function CalendarioPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('site_settings')
    .select('key, value')
    .eq('key', 'booking_calendars');

  const settings: Record<string, string> = {};
  (data || []).forEach((row: { key: string; value: string }) => {
    settings[row.key] = row.value;
  });

  return <CalendarSettingsForm initialSettings={settings} />;
}
