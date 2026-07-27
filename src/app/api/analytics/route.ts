import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { visitor_id, visitor_email, event_type, page_url, product_id, metadata } = body;

    if (!visitor_id || !event_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // ── Vercel Geolocation headers (free, automatic) ──────────────────────
    const city    = request.headers.get('x-vercel-ip-city')           ?? null;
    const region  = request.headers.get('x-vercel-ip-country-region') ?? null;
    const country = request.headers.get('x-vercel-ip-country')        ?? null;
    const lat     = request.headers.get('x-vercel-ip-latitude')       ?? null;
    const lon     = request.headers.get('x-vercel-ip-longitude')      ?? null;

    const enrichedMetadata = {
      ...(metadata || {}),
      geo: {
        city:    city    ? decodeURIComponent(city) : null,
        region,
        country,
        lat:     lat  ? parseFloat(lat)  : null,
        lon:     lon  ? parseFloat(lon)  : null,
      },
    };

    const supabase = await createClient();

    const { error } = await supabase.from('analytics_events').insert({
      visitor_id,
      visitor_email: visitor_email || null,
      event_type,
      page_url: page_url || '/',
      product_id: product_id || null,
      metadata: enrichedMetadata,
    });

    if (error) {
      console.warn('[Analytics Error]', error.message);
      return NextResponse.json({ success: false, warning: error.message }, { status: 200 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Analytics API Catch]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
