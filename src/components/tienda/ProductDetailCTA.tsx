'use client';

import React, { useState } from 'react';
import { useCart } from '@/lib/cart-context';
import ServiceBookingButton from '@/components/ui/ServiceBookingButton';
import DownloadModal from '@/components/tienda/DownloadModal';
import type { Product } from '@/lib/types';

export default function ProductDetailCTA({ product }: { product: Product }) {
  const { addBook, items, openCart } = useCart();
  const [downloading, setDownloading] = useState(false);
  const inCart = items.some((item) => item.id === product.id);
  const isFree = product.price === 0;
  const isService = product.product_type === 'service';

  if (isFree) {
    return (
      <>
        <button type="button" className="tienda-card-btn font-inter" onClick={() => setDownloading(true)}>
          Descargar gratis
        </button>
        {downloading && (
          <DownloadModal productId={product.id} productTitle={product.title} onClose={() => setDownloading(false)} />
        )}
      </>
    );
  }

  if (product.payment_provider === 'hotmart' && product.hotmart_url) {
    return (
      <a
        href={product.hotmart_url}
        target="_blank"
        rel="noopener noreferrer"
        className="tienda-card-btn font-inter"
        style={{ display: 'inline-block', textAlign: 'center' }}
      >
        {product.product_type === 'service' ? 'Adquiere el programa' : 'Comprar'}
      </a>
    );
  }

  if (isService || product.payment_provider === 'calendar') {
    return (
      <ServiceBookingButton
        title={product.title}
        price={`USD $${product.price}`}
        whatsappText={product.whatsapp_text || `Hola! Quiero información sobre ${product.title}`}
        buttonText={isService ? 'Solicitar Asesoría' : 'Agendar cita'}
        className="tienda-card-btn font-inter"
        calLink={product.cal_link || 'open-view-consultant-7ng550/30min'}
      />
    );
  }

  return (
    <button
      type="button"
      className="tienda-card-btn font-inter"
      onClick={() => {
        addBook(product);
        openCart();
      }}
    >
      {inCart ? 'Añadir otro' : 'Añadir al carrito'}
    </button>
  );
}
