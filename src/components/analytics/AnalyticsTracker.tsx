'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function trackEvent(eventType: string, extraData?: { page_url?: string; product_id?: string; metadata?: Record<string, unknown> }) {
  if (typeof window === 'undefined') return;

  let vid = localStorage.getItem('tmc_visitor_id');
  if (!vid) {
    vid = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'v_' + Math.random().toString(36).substring(2);
    localStorage.setItem('tmc_visitor_id', vid);
  }

  const visitorEmail = localStorage.getItem('tmc_visitor_email') || null;

  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      visitor_id: vid,
      visitor_email: visitorEmail,
      event_type: eventType,
      page_url: extraData?.page_url || window.location.pathname,
      product_id: extraData?.product_id || null,
      metadata: extraData?.metadata || {},
    }),
  }).catch(() => {});
}

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) {
      trackEvent('page_view', { page_url: pathname });
    }
  }, [pathname]);

  return null;
}
