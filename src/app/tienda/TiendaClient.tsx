'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import './tienda.css';
import { CartProvider, useCart } from '@/lib/cart-context';
import CartDrawer from '@/components/tienda/CartDrawer';
import DownloadModal from '@/components/tienda/DownloadModal';
import ServiceBookingButton from '@/components/ui/ServiceBookingButton';
import { formatUSD } from '@/lib/format';
import type { Product as SupabaseProduct } from '@/lib/types';

type Category = 'Todos' | 'Sueño infantil' | 'Alimentación' | 'Regalo';
type Subcategory = 'Todas' | 'Curso' | 'Guía' | 'Recetario' | 'Libro' | 'Asesoría' | 'Tarjeta de regalo' | 'Gratuitos';

const baseCategories: Category[] = ['Todos', 'Sueño infantil', 'Alimentación', 'Regalo'];
const subcategories: Subcategory[] = ['Todas', 'Curso', 'Guía', 'Recetario', 'Libro', 'Asesoría', 'Tarjeta de regalo', 'Gratuitos'];

function SupabaseProductCard({
  product,
  onDownloadClick,
}: {
  product: SupabaseProduct;
  onDownloadClick: (p: SupabaseProduct) => void;
}) {
  const { addBook, items } = useCart();
  const inCart = items.some((item) => item.id === product.id);
  const isFree = product.price === 0;
  const isService = product.product_type === 'service';

  return (
    <div className="tienda-card">
      <div className="tienda-card-image">
        {product.cover_image_url ? (
          <img src={product.cover_image_url} alt={product.title} loading="lazy" />
        ) : (
          <div className="libro-cover-placeholder">
            <span>{product.title}</span>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <h3 className="tienda-card-title font-inter">{product.title}</h3>
        <p className="tienda-card-price font-inter">{isFree ? 'Gratis' : formatUSD(product.price)}</p>
        {isFree ? (
          <button
            type="button"
            onClick={() => onDownloadClick(product)}
            className="tienda-card-btn font-inter"
          >
            Descargar gratis
          </button>
        ) : product.payment_provider === 'hotmart' && product.hotmart_url ? (
          <a
            href={product.hotmart_url}
            target="_blank"
            rel="noopener noreferrer"
            className="tienda-card-btn font-inter"
          >
            Comprar
          </a>
        ) : isService || product.payment_provider === 'calendar' ? (
          <ServiceBookingButton
            productId={product.id}
            title={product.title}
            price={product.price}
            calendarId={product.booking_calendar_id}
            buttonText={isService ? 'Solicitar Asesoría' : 'Agendar cita'}
            className="tienda-card-btn font-inter"
          />
        ) : (
          <button type="button" className="tienda-card-btn font-inter" onClick={() => addBook(product)}>
            {inCart ? 'Añadir otro' : 'Añadir al carrito'}
          </button>
        )}
      </div>
    </div>
  );
}

export default function TiendaClient({ products }: { products: SupabaseProduct[] }) {
  const categories = useMemo(() => {
    const dynamic = Array.from(new Set(products.map((p) => p.category))).filter(
      (cat) => !baseCategories.includes(cat as Category)
    );
    return [...baseCategories, ...dynamic];
  }, [products]);

  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [activeSubcategory, setActiveSubcategory] = useState<Subcategory>('Todas');

  const visibleSupabaseProducts = products
    .filter((p) => activeCategory === 'Todos' || p.category === activeCategory)
    .filter((p) => {
      if (activeSubcategory === 'Todas') return true;
      if (activeSubcategory === 'Gratuitos') return p.subcategory === 'Gratuitos' || p.price === 0;
      return p.subcategory === activeSubcategory;
    });

  const [downloadingProduct, setDownloadingProduct] = useState<SupabaseProduct | null>(null);

  return (
    <div className="tienda-main">
      <div className="tienda-back-section">
        <Link href="/" className="tienda-back font-inter">← Volver al inicio</Link>
      </div>

      <div className="tienda-header-sticky">
        <h1 className="tienda-title font-fraunces">Tienda</h1>
      </div>

      <div className="tienda-subtitle-section">
        <p className="tienda-subtitle font-inter">
          Guías, recetarios, libros, programas y asesorías para acompañarte en cada etapa.
        </p>
      </div>

      <div className="tienda-filters-sticky">
        <div className="tienda-categories">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`tienda-category-btn font-inter ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="tienda-categories" style={{ marginTop: '10px' }}>
          {subcategories.map((sub) => (
            <button
              key={sub}
              className={`tienda-category-btn font-inter ${activeSubcategory === sub ? 'active' : ''}`}
              onClick={() => setActiveSubcategory(sub)}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      <div className="tienda-container">
        <div className="tienda-grid">
          {visibleSupabaseProducts.map((product) => (
            <SupabaseProductCard
              key={product.id}
              product={product}
              onDownloadClick={(p) => setDownloadingProduct(p)}
            />
          ))}
        </div>
      </div>

      {downloadingProduct && (
        <DownloadModal
          productId={downloadingProduct.id}
          productTitle={downloadingProduct.title}
          onClose={() => setDownloadingProduct(null)}
        />
      )}
    </div>
  );
}
