import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('site_settings')
    .select('key, value');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const settings: Record<string, string> = {};
  (data || []).forEach((row: { key: string; value: string }) => {
    settings[row.key] = row.value;
  });

  return NextResponse.json(settings);
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const body = await req.json();

  const upserts = Object.entries(body).map(([key, value]) => ({ key, value }));
  const { error } = await supabase
    .from('site_settings')
    .upsert(upserts, { onConflict: 'key' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
