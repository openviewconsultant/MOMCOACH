'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import './tienda.css';
import { useCart } from '@/lib/cart-context';
import DownloadModal from '@/components/tienda/DownloadModal';
import PdfPreviewModal from '@/components/tienda/PdfPreviewModal';
import ServiceBookingButton from '@/components/ui/ServiceBookingButton';
import { formatUSD } from '@/lib/format';
import type { Product as SupabaseProduct } from '@/lib/types';

type Category = 'Todos' | 'Sueño infantil' | 'Alimentación' | 'Regalo';
type Subcategory = 'Todas' | 'Curso' | 'Ebook' | 'Recetario' | 'Asesoría' | 'Tarjeta de regalo' | 'Gratuitos';

const baseCategories: Category[] = ['Todos', 'Sueño infantil', 'Alimentación', 'Regalo'];
const subcategories: Subcategory[] = ['Todas', 'Curso', 'Ebook', 'Recetario', 'Asesoría', 'Tarjeta de regalo', 'Gratuitos'];

function SupabaseProductCard({
  product,
  onDownloadClick,
  onPreviewClick,
}: {
  product: SupabaseProduct;
  onDownloadClick: (p: SupabaseProduct) => void;
  onPreviewClick: (p: SupabaseProduct, rect: DOMRect) => void;
}) {
  const { addBook, items } = useCart();
  const inCart = items.some((item) => item.id === product.id);
  const isFree = product.price === 0;
  const isService = product.product_type === 'service';
  const isPreviewable = Boolean(product.file_path);

  return (
    <div
      className={`tienda-card ${isPreviewable ? 'is-previewable' : ''}`}
      onClick={
        isPreviewable
          ? (e) => onPreviewClick(product, e.currentTarget.getBoundingClientRect())
          : undefined
      }
    >
      <div className="tienda-card-image">
        {product.cover_image_url ? (
          <img src={product.cover_image_url} alt={product.title} loading="lazy" />
        ) : (
          <div className="libro-cover-placeholder">
            <span>{product.title}</span>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }} onClick={(e) => e.stopPropagation()}>
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
  const { addBook, openCart, items } = useCart();

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
  const [previewTarget, setPreviewTarget] = useState<{ item: SupabaseProduct; rect: DOMRect | null } | null>(null);

  function previewCta(item: SupabaseProduct): { label: string; onClick: () => void } {
    const inCart = items.some((cartItem) => cartItem.id === item.id);
    if (item.price === 0) {
      return { label: 'Descargar gratis', onClick: () => setDownloadingProduct(item) };
    }
    if (item.payment_provider === 'hotmart' && item.hotmart_url) {
      return { label: 'Comprar', onClick: () => window.open(item.hotmart_url!, '_blank', 'noopener,noreferrer') };
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
              onPreviewClick={(p, rect) => setPreviewTarget({ item: p, rect })}
            />
          ))}
        </div>
      </div>

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
