'use client';

import React, { useState } from 'react';
import Reveal from '@/components/ui/Reveal';
import DownloadModal from '@/components/tienda/DownloadModal';
import { useCart } from '@/lib/cart-context';
import type { Product } from '@/lib/types';
import './category-digital-shop.css';

interface CategoryDigitalShopProps {
  guides: Product[];
  freebies: Product[];
  guidesTitle: string;
  guidesSubtitle: string;
}

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

export default function CategoryDigitalShop({ guides, freebies, guidesTitle, guidesSubtitle }: CategoryDigitalShopProps) {
  const { addBook, openCart, items } = useCart();
  const [downloadTarget, setDownloadTarget] = useState<Product | null>(null);

  return (
    <>
      {guides.length > 0 && (
        <div className="shop-section">
          <Reveal as="div" className="shop-section-head">
            <h2 className="font-forum">{guidesTitle}</h2>
            <p className="font-inter">{guidesSubtitle}</p>
          </Reveal>
          <div className="shop-card-grid">
            {guides.map((guide, idx) => {
              const inCart = items.some((item) => item.id === guide.id);
              return (
                <Reveal key={guide.id} delay={idx * 60} as="div" className="shop-mini-card">
                  <span className="shop-mini-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                      <path d="M14 3v5h5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                      <path d="M9 13h6M9 16.5h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </span>
                  <h4 className="font-forum">{guide.title}</h4>
                  <div className="shop-mini-footer">
                    <span className="shop-mini-price font-inter">USD ${guide.price}</span>
                    <button
                      type="button"
                      className="shop-mini-btn font-inter"
                      onClick={() => {
                        addBook(guide);
                        openCart();
                      }}
                    >
                      {inCart ? 'Añadir otro' : 'Añadir al carrito'}
                    </button>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      )}

      {freebies.length > 0 && (
        <div className="shop-section">
          <Reveal as="div" className="shop-section-head">
            <h2 className="font-forum">Material Descargable Gratuito</h2>
            <p className="font-inter">Recursos para acompañarte hoy mismo, sin costo.</p>
          </Reveal>
          <div className="shop-free-list">
            {freebies.map((item, idx) => (
              <Reveal key={item.id} delay={idx * 40} as="div" className="shop-free-row">
                <span className="shop-free-icon" aria-hidden="true">
                  <FreebieIcon title={item.title} />
                </span>
                <h4 className="font-forum">{item.title}</h4>
                <button
                  type="button"
                  className="shop-free-btn font-inter"
                  onClick={() => setDownloadTarget(item)}
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M12 4v11m0 0 4-4m-4 4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M5 18h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span className="shop-free-btn-label">Descargar</span>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      )}

      {downloadTarget && (
        <DownloadModal
          productId={downloadTarget.id}
          productTitle={downloadTarget.title}
          onClose={() => setDownloadTarget(null)}
        />
      )}
    </>
  );
}
