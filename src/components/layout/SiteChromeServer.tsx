import React from 'react';
import { createClient } from '@/lib/supabase/server';
import SiteChrome from './SiteChrome';

const DEFAULT_CONFIG = {
  eyebrow:  'Agenda tu',
  title:    'Llamada de descubrimiento',
  subtitle: '¡sin costo!',
  cta:      'Agenda aquí',
  calLink:  'open-view-consultant-7ng550/30min',
  enabled:  true,
};

export default async function SiteChromeServer({ children }: { children: React.ReactNode }) {
  let config = { ...DEFAULT_CONFIG };

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['popup_eyebrow', 'popup_title', 'popup_subtitle', 'popup_cta', 'popup_cal_link', 'popup_enabled']);

    if (data) {
      const map: Record<string, string> = {};
      data.forEach((row: { key: string; value: string }) => { map[row.key] = row.value; });

      config = {
        eyebrow:  map['popup_eyebrow']  ?? DEFAULT_CONFIG.eyebrow,
        title:    map['popup_title']    ?? DEFAULT_CONFIG.title,
        subtitle: map['popup_subtitle'] ?? DEFAULT_CONFIG.subtitle,
        cta:      map['popup_cta']      ?? DEFAULT_CONFIG.cta,
        calLink:  map['popup_cal_link'] ?? DEFAULT_CONFIG.calLink,
        enabled:  (map['popup_enabled'] ?? 'true') === 'true',
      };
    }
  } catch {
    // If site_settings table doesn't exist yet, fall back to defaults silently
  }

  return <SiteChrome popupConfig={config}>{children}</SiteChrome>;
}
