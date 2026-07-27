'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Cal, { getCalApi } from '@calcom/embed-react';
import './discovery-call-popup.css';

const CAL_LINK = 'open-view-consultant-7ng550/30min';

export default function DiscoveryCallPopup() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  const [open, setOpen] = useState(false);
  const [calOpen, setCalOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const cal = await getCalApi({ namespace: '30min' });
      cal('ui', {
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

  if (!isHomePage || !open) return null;

  return (
    <>
      <div className="discovery-popup-backdrop" onClick={() => setOpen(false)}>
        <div className="discovery-popup-panel" onClick={(e) => e.stopPropagation()}>
          <div className="discovery-popup-media" onClick={() => setCalOpen(true)}>
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
                data-cal-namespace="30min"
                data-cal-link={CAL_LINK}
                data-cal-config='{"layout":"month_view"}'
                onClick={(e) => e.stopPropagation()}
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

      {/* Hidden inline cal embed — shown via data-cal-link button above */}
      {calOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.55)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}
          onClick={() => setCalOpen(false)}
        >
          <div
            style={{
              background: '#181818',
              borderRadius: '16px',
              width: '90vw',
              maxWidth: '900px',
              height: '80vh',
              overflow: 'hidden',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setCalOpen(false)}
              style={{
                position: 'absolute',
                top: 12,
                right: 16,
                zIndex: 10,
                background: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '1.2rem',
                color: '#ffffff',
              }}
              aria-label="Cerrar"
            >✕</button>
            <Cal
              namespace="30min"
              calLink={CAL_LINK}
              style={{ width: '100%', height: '100%', overflow: 'scroll' }}
              config={{ layout: 'month_view' }}
            />
          </div>
        </div>
      )}
    </>
  );
}
