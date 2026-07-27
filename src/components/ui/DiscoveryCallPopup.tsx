'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getCalApi } from '@calcom/embed-react';
import './discovery-call-popup.css';

const CAL_LINK = 'open-view-consultant-7ng550/30min';

export default function DiscoveryCallPopup() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const [open, setOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const cal = await getCalApi({ namespace: '30min' });
      cal('ui', {
        theme: 'dark',
        hideEventTypeDetails: false,
        layout: 'month_view',
      });
    })();
  }, []);

  // Open the popup on the visitor's first scroll
  useEffect(() => {
    if (!isHomePage) return;
    const showOnScroll = () => setOpen(true);
    window.addEventListener('scroll', showOnScroll, { once: true, passive: true });
    return () => window.removeEventListener('scroll', showOnScroll);
  }, [isHomePage]);

  async function openCalModal() {
    const cal = await getCalApi({ namespace: '30min' });
    cal('modal', {
      calLink: CAL_LINK,
      config: { layout: 'month_view' },
    });
  }

  if (!isHomePage || !open) return null;

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
            <span className="discovery-popup-eyebrow">Agenda tu</span>
            <h2 className="discovery-popup-title">
              Llamada de descubrimiento
            </h2>
            <span className="discovery-popup-highlight">¡sin costo!</span>
            <button
              type="button"
              className="discovery-popup-cta"
              onClick={(e) => {
                e.stopPropagation();
                openCalModal();
              }}
            >
              Agenda aquí
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
