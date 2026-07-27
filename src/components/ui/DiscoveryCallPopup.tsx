'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { PopupModal } from 'react-calendly';
import './discovery-call-popup.css';

const CALENDLY_URL = 'https://calendly.com/edgarbarragangarcia/mom-coaching';

export default function DiscoveryCallPopup() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  const [open, setOpen] = useState(false);
  const [calendlyOpen, setCalendlyOpen] = useState(false);

  // Open the popup on the visitor's first scroll instead of a fixed delay.
  useEffect(() => {
    if (!isHomePage) return;
    const showOnScroll = () => setOpen(true);
    window.addEventListener('scroll', showOnScroll, { once: true, passive: true });
    return () => window.removeEventListener('scroll', showOnScroll);
  }, [isHomePage]);

  if (!isHomePage || !open) return null;

  return (
    <div className="discovery-popup-backdrop" onClick={() => setOpen(false)}>
      <div className="discovery-popup-panel" onClick={(e) => e.stopPropagation()}>
        <div className="discovery-popup-media" onClick={() => setCalendlyOpen(true)}>
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
                setCalendlyOpen(true);
              }}
            >
              Agenda aquí
            </button>
          </div>
        </div>

        {typeof document !== 'undefined' && (
          <PopupModal
            url={CALENDLY_URL}
            rootElement={document.body}
            open={calendlyOpen}
            onModalClose={() => setCalendlyOpen(false)}
          />
        )}

        <button
          type="button"
          className="discovery-popup-close"
          onClick={() => setOpen(false)}
          aria-label="Cerrar"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
