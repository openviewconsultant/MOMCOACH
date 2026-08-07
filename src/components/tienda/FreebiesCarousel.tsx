'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
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

// Cards sit on the rim of a large virtual circle (same trick labs.google's
// carousel uses) so the row reads as a shallow concave arc: the centered
// card sits highest and flattest, and its two neighbors on each side tilt
// and dip down — always exactly one card centered per snap/step.
const CIRCLE_RADIUS = 750;
const MAX_ANGLE_DEG = 22;
const CARDS_PER_STEP = 3;

export default function FreebiesCarousel({ items, onCardClick, onDownloadClick }: FreebiesCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);
  const [centeredIndex, setCenteredIndex] = useState(0);

  function cardStep() {
    const track = trackRef.current;
    if (!track) return 0;
    const card = track.querySelector<HTMLElement>('.freebies-card');
    if (!card) return 0;
    const gap = parseFloat(getComputedStyle(track).columnGap || '0');
    return card.offsetWidth + gap;
  }

  function scrollByCards(direction: 'prev' | 'next') {
    const track = trackRef.current;
    if (!track) return;
    const delta = cardStep() * CARDS_PER_STEP;
    track.scrollBy({ left: direction === 'next' ? delta : -delta, behavior: 'smooth' });
  }

  const applyCircleCurve = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const trackRect = track.getBoundingClientRect();
    const centerX = trackRect.left + trackRect.width / 2;
    const maxAngleRad = (MAX_ANGLE_DEG * Math.PI) / 180;

    let closestIdx = 0;
    let closestDistance = Infinity;

    cardRefs.current.forEach((card, idx) => {
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const cardCenterX = rect.left + rect.width / 2;
      const offsetX = cardCenterX - centerX;
      const distance = Math.abs(offsetX);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIdx = idx;
      }

      const angle = Math.max(-maxAngleRad, Math.min(maxAngleRad, offsetX / CIRCLE_RADIUS));
      const angleDeg = (angle * 180) / Math.PI;
      const dip = CIRCLE_RADIUS * (1 - Math.cos(angle));
      const scale = 1 - Math.min(distance / 1100, 0.14);
      card.style.transform = `translateY(${dip}px) rotate(${angleDeg}deg) scale(${scale})`;
      card.style.zIndex = String(1000 - Math.round(distance));
    });

    setCenteredIndex(closestIdx);
  }, []);

  const handleScroll = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(applyCircleCurve);
  }, [applyCircleCurve]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    applyCircleCurve();
    track.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', applyCircleCurve);
    return () => {
      track.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', applyCircleCurve);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [applyCircleCurve, handleScroll]);

  return (
    <div className="freebies-carousel">
      <div className="freebies-track" ref={trackRef}>
        {items.map((item, idx) => (
          <button
            key={item.id}
            ref={(el) => {
              cardRefs.current[idx] = el;
            }}
            type="button"
            className="freebies-card"
            onClick={(e) => onCardClick(item, e.currentTarget.getBoundingClientRect())}
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
              <h4 className="font-forum">{item.title}</h4>
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
          <button type="button" className="freebies-arrow" onClick={() => scrollByCards('prev')} aria-label="Anterior">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div className="freebies-progress" aria-hidden="true">
            <div
              className="freebies-progress-fill"
              style={{ width: `${((centeredIndex + 1) / items.length) * 100}%` }}
            />
          </div>

          <button type="button" className="freebies-arrow" onClick={() => scrollByCards('next')} aria-label="Siguiente">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
