'use client';

import React, { useState } from 'react';
import Reveal from '@/components/ui/Reveal';
import DownloadModal from '@/components/tienda/DownloadModal';
import { useCart } from '@/lib/cart-context';
import type { Product } from '@/lib/types';

export default function SuenoShop({ guides, freebies }: { guides: Product[]; freebies: Product[] }) {
  const { addBook, openCart, items } = useCart();
  const [downloadTarget, setDownloadTarget] = useState<Product | null>(null);

  return (
    <>
      {guides.length > 0 && (
        <div className="sueno-shop-section">
          <Reveal as="div" className="sueno-section-head">
            <h2 className="font-forum">Guías Digitales de Sueño</h2>
            <p className="font-inter">Formatos prácticos y descargables para aplicar a tu propio ritmo.</p>
          </Reveal>
          <div className="sueno-card-grid">
            {guides.map((guide, idx) => {
              const inCart = items.some((item) => item.id === guide.id);
              return (
                <Reveal key={guide.id} delay={idx * 60} as="div" className="sueno-mini-card">
                  <h4 className="font-forum">{guide.title}</h4>
                  <span className="sueno-mini-price font-inter">USD ${guide.price}</span>
                  <button
                    type="button"
                    className="sueno-mini-btn font-inter"
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
        <div className="sueno-shop-section">
          <Reveal as="div" className="sueno-section-head">
            <h2 className="font-forum">Material Descargable Gratuito</h2>
            <p className="font-inter">Recursos para acompañarte hoy mismo, sin costo.</p>
          </Reveal>
          <div className="sueno-card-grid">
            {freebies.map((item, idx) => (
              <Reveal key={item.id} delay={idx * 60} as="div" className="sueno-mini-card">
                <span className="sueno-mini-badge font-inter">Gratis</span>
                <h4 className="font-forum">{item.title}</h4>
                <button
                  type="button"
                  className="sueno-mini-btn free font-inter"
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
