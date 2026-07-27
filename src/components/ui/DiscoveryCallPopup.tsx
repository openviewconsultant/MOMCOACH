'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getCalApi } from '@calcom/embed-react';
import './discovery-call-popup.css';

interface PopupConfig {
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
  calLink: string;
  enabled: boolean;
}

export default function DiscoveryCallPopup({ config }: { config: PopupConfig }) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const [open, setOpen] = useState(false);

  const namespace = config.calLink.split('/').pop() || '30min';

  useEffect(() => {
    (async () => {
      const cal = await getCalApi({ namespace });
      cal('ui', {
        theme: 'dark',
        hideEventTypeDetails: false,
        layout: 'month_view',
      });
    })();
  }, [namespace]);

  // Open on first scroll (only on homepage, only if enabled)
  useEffect(() => {
    if (!isHomePage || !config.enabled) return;
    const showOnScroll = () => setOpen(true);
    window.addEventListener('scroll', showOnScroll, { once: true, passive: true });
    return () => window.removeEventListener('scroll', showOnScroll);
  }, [isHomePage, config.enabled]);

  async function openCalModal() {
    const calSlug = config.calLink.startsWith('http')
      ? config.calLink.replace(/^https?:\/\/cal\.com\//, '')
      : config.calLink;
    const cal = await getCalApi({ namespace });
    cal('modal', {
      calLink: calSlug,
      config: { layout: 'month_view' },
    });
  }

  if (!isHomePage || !open || !config.enabled) return null;

  return (
    <div className="discovery-popup-backdrop" onClick={() => setOpen(false)}>
      <div className="discovery-popup-panel" onClick={(e) => e.stopPropagation()}>
        <div className="discovery-popup-media" onClick={openCalModal}>
          <video
            className="discovery-popup-video"
            src="/discovery-popup-bg.mp4"
            autoPlay
            loop
            muted
            playsInline
          />
          <div className="discovery-popup-overlay">
            <span className="discovery-popup-eyebrow">{config.eyebrow}</span>
            <h2 className="discovery-popup-title">{config.title}</h2>
            <span className="discovery-popup-highlight">{config.subtitle}</span>
            <button
              type="button"
              className="discovery-popup-cta"
              onClick={(e) => {
                e.stopPropagation();
                openCalModal();
              }}
            >
              {config.cta}
            </button>
          </div>
        </div>

        <button
          type="button"
          className="discovery-popup-close"
          onClick={() => setOpen(false)}
          aria-label="Cerrar"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
