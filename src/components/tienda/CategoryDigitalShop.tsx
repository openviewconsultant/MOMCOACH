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
                  <h4 className="font-forum">{guide.title}</h4>
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
              <Reveal key={item.id} delay={idx * 60} as="div" className="shop-mini-card">
                <span className="shop-mini-badge font-inter">Gratis</span>
                <h4 className="font-forum">{item.title}</h4>
                <button
                  type="button"
                  className="shop-mini-btn free font-inter"
                  onClick={() => setDownloadTarget(item)}
                >
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
