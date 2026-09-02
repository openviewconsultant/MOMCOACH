'use client';

import React, { useState } from 'react';
import Reveal from '@/components/ui/Reveal';
import DownloadModal from '@/components/tienda/DownloadModal';
import PdfPreviewModal from '@/components/tienda/PdfPreviewModal';
import FreebiesCarousel from '@/components/tienda/FreebiesCarousel';
import { useCart } from '@/lib/cart-context';
import ServiceBookingButton from '@/components/ui/ServiceBookingButton';
import BookingModal from '@/components/ui/BookingModal';
import { formatUSD } from '@/lib/format';
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
  const [previewTarget, setPreviewTarget] = useState<{ item: Product; rect: DOMRect | null } | null>(null);
  const [bookingTarget, setBookingTarget] = useState<Product | null>(null);

  function previewCta(item: Product): { label: string; onClick: () => void } {
    const inCart = items.some((cartItem) => cartItem.id === item.id);

    if (item.price === 0) {
      return { label: 'Descargar gratis', onClick: () => setDownloadTarget(item) };
    }
    if (item.payment_provider === 'hotmart' && item.hotmart_url) {
      return { label: 'Comprar', onClick: () => window.open(item.hotmart_url!, '_blank', 'noopener,noreferrer') };
    }
    if (item.payment_provider === 'calendar') {
      return { label: 'Agendar cita', onClick: () => setBookingTarget(item) };
    }
    return {
      label: inCart ? 'Añadir otro' : 'Añadir al carrito',
      onClick: () => {
        addBook(item);
        openCart();
      },
    };
  }

  return (
    <>
      {guides.length > 0 && (
        <div className="shop-section">
          <Reveal as="div" className="shop-section-head">
            <h2 className="font-fraunces">{guidesTitle}</h2>
            <p className="font-inter">{guidesSubtitle}</p>
          </Reveal>
          <div className="shop-card-grid">
            {guides.map((guide, idx) => {
              const inCart = items.some((item) => item.id === guide.id);
              return (
                <Reveal
                  key={guide.id}
                  delay={idx * 60}
                  as="div"
                  className={`shop-mini-card ${guide.file_path ? 'is-previewable' : ''}`}
                  onClick={(e) => {
                    if (!guide.file_path) return;
                    setPreviewTarget({ item: guide, rect: e.currentTarget.getBoundingClientRect() });
                  }}
                >
                  {guide.cover_image_url ? (
                    <span className="shop-mini-image">
                      <img src={guide.cover_image_url} alt={guide.title} loading="lazy" />
                    </span>
                  ) : (
                    <span className="shop-mini-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                        <path d="M14 3v5h5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                        <path d="M9 13h6M9 16.5h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      </svg>
                    </span>
                  )}
                  <h4 className="font-fraunces">{guide.title}</h4>
                  <div className="shop-mini-footer" onClick={(e) => e.stopPropagation()}>
                    <span className="shop-mini-price font-inter">USD ${guide.price}</span>
                    {guide.payment_provider === 'hotmart' && guide.hotmart_url ? (
                      <a
                        href={guide.hotmart_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shop-mini-btn font-inter"
                      >
                        Comprar
                      </a>
                    ) : guide.payment_provider === 'calendar' ? (
                      <ServiceBookingButton
                        productId={guide.id}
                        title={guide.title}
                        price={guide.price}
                        calendarId={guide.booking_calendar_id}
                        buttonText="Agendar cita"
                        className="shop-mini-btn font-inter"
                      />
                    ) : (
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
                    )}
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
            <h2 className="font-fraunces">Material Descargable Gratuito</h2>
            <p className="font-inter">Recursos para acompañarte hoy mismo, sin costo.</p>
          </Reveal>
          <FreebiesCarousel
            items={freebies}
            onCardClick={(item, rect) => setPreviewTarget({ item, rect })}
            onDownloadClick={(item) => setDownloadTarget(item)}
          />
        </div>
      )}

      {previewTarget && (
        <PdfPreviewModal
          productId={previewTarget.item.id}
          productTitle={previewTarget.item.title}
          badgeLabel={previewTarget.item.price === 0 ? 'Gratis' : formatUSD(previewTarget.item.price)}
          originRect={previewTarget.rect}
          onClose={() => setPreviewTarget(null)}
          ctaLabel={previewCta(previewTarget.item).label}
          onCta={() => {
            previewCta(previewTarget.item).onClick();
            setPreviewTarget(null);
          }}
        />
      )}

      {downloadTarget && (
        <DownloadModal
          productId={downloadTarget.id}
          productTitle={downloadTarget.title}
          onClose={() => setDownloadTarget(null)}
        />
      )}

      {bookingTarget && (
        <BookingModal
          productId={bookingTarget.id}
          productTitle={bookingTarget.title}
          price={bookingTarget.price}
          priceLabel={formatUSD(bookingTarget.price)}
          calendarId={bookingTarget.booking_calendar_id}
          onClose={() => setBookingTarget(null)}
        />
      )}
    </>
  );
}
