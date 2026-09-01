'use client';

import React, { useEffect, useRef, useState } from 'react';
import EbookCoverThumbnail from '@/components/tienda/EbookCoverThumbnail';
import type { Product } from '@/lib/types';

function FreebieIcon({ title }: { title: string }) {
  const t = title.toLowerCase();
  if (t.includes('recetario') || t.includes('aliment')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 3v9a3 3 0 0 0 3 3v6M6 3v6M9 3v6M12 3v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18 3c-1.7 0-3 1.8-3 4s1.3 4 3 4v10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (t.includes('tabla') || t.includes('checklist') || t.includes('diario')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M4 10h16M10 10v10" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }
  if (t.includes('sueño') || t.includes('siesta') || t.includes('regresion') || t.includes('newborn') || t.includes('sleep')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a7 7 0 0 0 11 11Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M14 3v5h5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 13h6M9 16.5h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

interface FreebiesCarouselProps {
  items: Product[];
  onCardClick: (item: Product, rect: DOMRect) => void;
  onDownloadClick: (item: Product) => void;
}

const AUTOPLAY_INTERVAL_MS = 3200;
const RESUME_AFTER_INTERACTION_MS = 5000;

export default function FreebiesCarousel({ items, onCardClick, onDownloadClick }: FreebiesCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const [paused, setPaused] = useState(false);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  function cardWidth() {
    const track = trackRef.current;
    if (!track) return 0;
    const card = track.querySelector<HTMLElement>('.freebies-card');
    if (!card) return 0;
    const gap = parseFloat(getComputedStyle(track).columnGap || '0');
    return card.offsetWidth + gap;
  }

  // Scrolls the track element itself (via scrollLeft), not scrollIntoView:
  // scrollIntoView walks up every scrollable ancestor including the page,
  // so on mobile — where the card isn't always fully visible vertically —
  // it was dragging the whole page down on every autoplay tick.
  function scrollByCards(direction: 'prev' | 'next') {
    const track = trackRef.current;
    if (!track || items.length === 0) return;
    const nextIndex =
      direction === 'next'
        ? (activeIndexRef.current + 1) % items.length
        : (activeIndexRef.current - 1 + items.length) % items.length;
    const card = track.querySelectorAll<HTMLElement>('.freebies-card')[nextIndex];
    if (card) {
      track.scrollTo({ left: card.offsetLeft, behavior: 'smooth' });
    }
    setActiveIndex(nextIndex);
  }

  function pauseAutoplayTemporarily() {
    setPaused(true);
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => setPaused(false), RESUME_AFTER_INTERACTION_MS);
  }

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    function handleScroll() {
      const track = trackRef.current;
      if (!track) return;
      const width = cardWidth();
      if (!width) return;
      const index = Math.round(track.scrollLeft / width);
      setActiveIndex(Math.max(0, Math.min(index, items.length - 1)));
    }

    track.addEventListener('scroll', handleScroll, { passive: true });
    return () => track.removeEventListener('scroll', handleScroll);
  }, [items.length]);

  useEffect(() => {
    if (paused || items.length < 2) return;
    const id = setInterval(() => scrollByCards('next'), AUTOPLAY_INTERVAL_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, items.length]);

  useEffect(() => {
    return () => {
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    };
  }, []);

  return (
    <div
      className="freebies-carousel"
      onMouseEnter={pauseAutoplayTemporarily}
      onTouchStart={pauseAutoplayTemporarily}
    >
      <div className="freebies-track" ref={trackRef}>
        {items.map((item, idx) => (
          <button
            key={item.id}
            type="button"
            className={`freebies-card ${idx === activeIndex ? 'is-active' : ''}`}
            onClick={(e) => {
              pauseAutoplayTemporarily();
              onCardClick(item, e.currentTarget.getBoundingClientRect());
            }}
          >
            <span className="freebies-card-cover" aria-hidden="true">
              {!item.cover_image_url && (
                <span className="freebies-card-icon">
                  <FreebieIcon title={item.title} />
                </span>
              )}
              <EbookCoverThumbnail productId={item.id} coverImageUrl={item.cover_image_url} />
            </span>
            <span className="freebies-card-body">
              <h4 className="font-fraunces">{item.title}</h4>
              <span
                className="freebies-card-btn font-inter"
                onClick={(e) => {
                  e.stopPropagation();
                  onDownloadClick(item);
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M12 4v11m0 0 4-4m-4 4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5 18h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span className="freebies-card-btn-label">Descargar</span>
              </span>
            </span>
          </button>
        ))}
      </div>

      {items.length > 1 && (
        <div className="freebies-controls">
          <button
            type="button"
            className="freebies-arrow"
            onClick={() => {
              pauseAutoplayTemporarily();
              scrollByCards('prev');
            }}
            aria-label="Anterior"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div className="freebies-progress" aria-hidden="true">
            <div
              className="freebies-progress-fill"
              style={{ width: `${((activeIndex + 1) / items.length) * 100}%` }}
            />
          </div>

          <button
            type="button"
            className="freebies-arrow"
            onClick={() => {
              pauseAutoplayTemporarily();
              scrollByCards('next');
            }}
            aria-label="Siguiente"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
