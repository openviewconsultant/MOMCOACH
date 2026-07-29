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
          <div className="shop-card-grid">
            {freebies.map((item, idx) => (
              <Reveal key={item.id} delay={idx * 60} as="div" className="shop-mini-card free">
                <span className="shop-mini-badge font-inter">Gratis</span>
                <span className="shop-mini-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                    <path d="M14 3v5h5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                    <path d="M9 13h6M9 16.5h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </span>
                <h4 className="font-forum">{item.title}</h4>
                <button
                  type="button"
                  className="shop-mini-btn free font-inter"
                  onClick={() => setDownloadTarget(item)}
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M12 4v11m0 0 4-4m-4 4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M5 18h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Descargar gratis
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
