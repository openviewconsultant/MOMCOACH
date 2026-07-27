'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// ─── Core tracking function ──────────────────────────────────────────────────

export function trackEvent(
  eventType: string,
  extraData?: {
    page_url?: string;
    product_id?: string;
    metadata?: Record<string, unknown>;
  }
) {
  if (typeof window === 'undefined') return;

  // Ensure visitor ID exists (anonymous, persists in localStorage)
  let vid = localStorage.getItem('tmc_visitor_id');
  if (!vid) {
    vid =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : 'v_' + Math.random().toString(36).substring(2);
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

// ─── Click tracking helpers ──────────────────────────────────────────────────

/** Returns the best human-readable label for a clicked element */
function getClickLabel(el: HTMLElement): string | null {
  // Traverse up to 5 levels to find a meaningful element
  let current: HTMLElement | null = el;
  for (let i = 0; i < 5; i++) {
    if (!current) break;
    const tag = current.tagName?.toLowerCase();
    if (tag === 'a' || tag === 'button' || current.getAttribute('role') === 'button') {
      const label =
        current.getAttribute('aria-label') ||
        current.textContent?.trim().replace(/\s+/g, ' ').substring(0, 80) ||
        current.getAttribute('href') ||
        tag;
      return label || null;
    }
    current = current.parentElement;
  }
  return null;
}

/** Returns the href of the closest anchor */
function getHref(el: HTMLElement): string | null {
  let current: HTMLElement | null = el;
  for (let i = 0; i < 5; i++) {
    if (!current) break;
    if (current.tagName?.toLowerCase() === 'a') {
      return current.getAttribute('href');
    }
    current = current.parentElement;
  }
  return null;
}

// ─── Main tracker component ──────────────────────────────────────────────────

export function AnalyticsTracker() {
  const pathname = usePathname();

  // Track page views on route change
  useEffect(() => {
    if (pathname) {
      trackEvent('page_view', { page_url: pathname });
    }
  }, [pathname]);

  // Track all clicks globally (fire-and-forget, non-blocking)
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const label = getClickLabel(target);
      if (!label) return; // Ignore clicks on non-interactive elements

      const href = getHref(target);

      trackEvent('click', {
        page_url: window.location.pathname,
        metadata: {
          label,
          href: href || undefined,
          tag: target.tagName?.toLowerCase(),
        },
      });
    };

    document.addEventListener('click', handleClick, { passive: true });
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return null;
}
