'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import FreeCallModal from './FreeCallModal';
import { prefetchAvailability } from '@/lib/booking-availability-cache';
import './discovery-call-popup.css';

interface PopupConfig {
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
  enabled: boolean;
  calendarId: string;
}

export default function DiscoveryCallPopup({ config }: { config: PopupConfig }) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const [open, setOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);

  // Open on first scroll (only on homepage, only if enabled). Precarga la
  // disponibilidad en ese momento, en vez de esperar a que se abra el
  // formulario, para que no se note el tiempo de carga al hacer clic.
  useEffect(() => {
    if (!isHomePage || !config.enabled) return;
    const showOnScroll = () => {
      setOpen(true);
      prefetchAvailability(config.calendarId);
    };
    window.addEventListener('scroll', showOnScroll, { once: true, passive: true });
    return () => window.removeEventListener('scroll', showOnScroll);
  }, [isHomePage, config.enabled, config.calendarId]);

  if (bookingOpen) {
    return (
      <FreeCallModal
        title={config.title}
        subtitle={`${config.subtitle} Elige el horario que mejor te quede.`}
        calendarId={config.calendarId}
        onClose={() => {
          setBookingOpen(false);
          setOpen(false);
        }}
      />
    );
  }

  if (!isHomePage || !open || !config.enabled) return null;

  return (
    <div className="discovery-popup-backdrop" onClick={() => setOpen(false)}>
      <div className="discovery-popup-panel" onClick={(e) => e.stopPropagation()}>
        <div className="discovery-popup-media" onClick={() => setBookingOpen(true)}>
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
                setBookingOpen(true);
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
