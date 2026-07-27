import { createClient } from '@/lib/supabase/server';
import PopupSettingsForm from './PopupSettingsForm';

export default async function ConfiguracionPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('site_settings')
    .select('key, value');

  const settings: Record<string, string> = {};
  (data || []).forEach((row: { key: string; value: string }) => {
    settings[row.key] = row.value;
  });

  return <PopupSettingsForm initialSettings={settings} />;
}
