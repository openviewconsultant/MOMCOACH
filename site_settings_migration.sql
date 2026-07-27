-- Run this in Supabase SQL Editor to enable the popup settings feature
CREATE TABLE IF NOT EXISTS public.site_settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Only authenticated admins can read/write
CREATE POLICY "Admin full access" ON public.site_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- Seed default popup values
INSERT INTO public.site_settings (key, value) VALUES
  ('popup_enabled',  'true'),
  ('popup_eyebrow',  'Agenda tu'),
  ('popup_title',    'Llamada de descubrimiento'),
  ('popup_subtitle', '¡sin costo!'),
  ('popup_cta',      'Agenda aquí'),
  ('popup_cal_link', 'open-view-consultant-7ng550/30min')
ON CONFLICT (key) DO NOTHING;
