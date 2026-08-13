import { createClient } from '@/lib/supabase/server';
import { getCalendarOptions } from '@/lib/calendarOptions';
import PopupSettingsForm from './PopupSettingsForm';

export default async function ConfiguracionPage() {
  const supabase = await createClient();

  const [{ data }, calendarOptions] = await Promise.all([
    supabase.from('site_settings').select('key, value'),
    getCalendarOptions(),
  ]);

  const settings: Record<string, string> = {};
  (data || []).forEach((row: { key: string; value: string }) => {
    settings[row.key] = row.value;
  });

  return <PopupSettingsForm initialSettings={settings} calendarOptions={calendarOptions} />;
}
