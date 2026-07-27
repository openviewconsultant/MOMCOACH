import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { visitor_id, visitor_email, event_type, page_url, product_id, metadata } = body;

    if (!visitor_id || !event_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // ── Vercel Geolocation headers ──────────────────────────────────────────
    let city    = request.headers.get('x-vercel-ip-city');
    let region  = request.headers.get('x-vercel-ip-country-region');
    let country = request.headers.get('x-vercel-ip-country');
    let lat     = request.headers.get('x-vercel-ip-latitude');
    let lon     = request.headers.get('x-vercel-ip-longitude');

    if (city) {
      try { city = decodeURIComponent(city); } catch { /* keep as is */ }
    }

    // ── Fallback to IP geolocation if Vercel header didn't include city ─────
    if (!city) {
      const forwarded = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
      const ip = forwarded ? forwarded.split(',')[0].trim() : null;

      if (ip && ip !== '::1' && ip !== '127.0.0.1' && !ip.startsWith('192.168.')) {
        try {
          const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,countryCode,regionName,city,lat,lon`, {
            signal: AbortSignal.timeout(1500),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.status === 'success') {
              city    = city    || data.city    || null;
              region  = region  || data.regionName || null;
              country = country || data.countryCode || null;
              lat     = lat     || (data.lat ? String(data.lat) : null);
              lon     = lon     || (data.lon ? String(data.lon) : null);
            }
          }
        } catch {
          /* Fallback failed silently, proceed */
        }
      }
    }

    const enrichedMetadata = {
      ...(metadata || {}),
      geo: {
        city:    city    || null,
        region:  region  || null,
        country: country || null,
        lat:     lat ? parseFloat(lat) : null,
        lon:     lon ? parseFloat(lon) : null,
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
