'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Product } from '@/lib/types';
import ProductRowActions from './ProductRowActions';
import { formatUSD } from '@/lib/format';
import { generateAndSaveCover } from '@/lib/render-pdf-cover';
import { PRODUCT_SUBCATEGORIES } from '@/lib/product-subcategories';
import DiscountBadge, { PriceLabel } from '@/components/ui/DiscountBadge';

const PREDEFINED_CATEGORIES = [
  'Alimentación',
  'Sueño infantil',
  'Regalo',
];

const SUBCATEGORIES: readonly string[] = PRODUCT_SUBCATEGORIES;

interface AdminProductsListProps {
  products: Product[];
}

export default function AdminProductsList({ products }: AdminProductsListProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [subcategoryFilter, setSubcategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [generatingCovers, setGeneratingCovers] = useState(false);
  const [coverProgress, setCoverProgress] = useState({ done: 0, total: 0 });
  const [failedCovers, setFailedCovers] = useState<string[]>([]);

  const productsMissingCovers = useMemo(
    () => products.filter((p) => p.file_path && !p.cover_image_url),
    [products]
  );

  const publishedCount = useMemo(() => products.filter((p) => p.is_published).length, [products]);
  const freeCount = useMemo(() => products.filter((p) => p.price === 0).length, [products]);

  async function handleGenerateCovers() {
    setGeneratingCovers(true);
    setFailedCovers([]);
    setCoverProgress({ done: 0, total: productsMissingCovers.length });
    const failed: string[] = [];
    for (const product of productsMissingCovers) {
      const url = await generateAndSaveCover(product.id);
      if (!url) failed.push(product.title);
      setCoverProgress((prev) => ({ ...prev, done: prev.done + 1 }));
    }
    setFailedCovers(failed);
    setGeneratingCovers(false);
    router.refresh();
  }

  // Always show predefined categories + any additional ones from the DB
  const categories = useMemo(() => {
    const dbCats = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
    const extra = dbCats.filter((c) => !PREDEFINED_CATEGORIES.includes(c));
    return [...PREDEFINED_CATEGORIES, ...extra];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesTitle = product.title.toLowerCase().includes(query);
        const matchesSub = (product.subtitle || '').toLowerCase().includes(query);
        const matchesCategory = (product.category || '').toLowerCase().includes(query);
        if (!matchesTitle && !matchesSub && !matchesCategory) return false;
      }

      // Category filter (parent topic)
      if (categoryFilter !== 'all' && product.category !== categoryFilter) {
        return false;
      }

      // Subcategory filter — "Gratuitos" also includes any product priced
      // at 0, since not every free item has been manually tagged.
      if (subcategoryFilter !== 'all') {
        if (subcategoryFilter === 'Gratuitos') {
          const isGratuito = product.subcategory === 'Gratuitos' || product.price === 0;
          if (!isGratuito) return false;
        } else if (product.subcategory !== subcategoryFilter) {
          return false;
        }
      }

      // Type filter
      if (typeFilter !== 'all') {
        const isService = product.product_type === 'service';
        if (typeFilter === 'service' && !isService) return false;
        if (typeFilter === 'digital' && isService) return false;
      }

      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'published' && !product.is_published) return false;
        if (statusFilter === 'draft' && product.is_published) return false;
      }

      return true;
    });
  }, [products, searchTerm, categoryFilter, subcategoryFilter, typeFilter, statusFilter]);

  const hasActiveFilters =
    searchTerm !== '' ||
    categoryFilter !== 'all' ||
    subcategoryFilter !== 'all' ||
    typeFilter !== 'all' ||
    statusFilter !== 'all';

  function resetFilters() {
    setSearchTerm('');
    setCategoryFilter('all');
    setSubcategoryFilter('all');
    setTypeFilter('all');
    setStatusFilter('all');
  }

  return (
    <div>
      <div className="admin-products-sticky-top">
        <div className="admin-page-header">
          <div>
            <h1 className="admin-title font-fraunces">Productos</h1>
            <p className="admin-subtitle">Publica y gestiona los libros, guías y servicios de la tienda.</p>
          </div>
          <Link href="/admin/productos/nuevo" className="admin-new-btn">
            + Nuevo producto
          </Link>
        </div>

        <div className="admin-stats">
          <div className="admin-stat-card">
            <div className="admin-stat-label">Total de productos</div>
            <div className="admin-stat-value">{products.length}</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-label">Publicados</div>
            <div className="admin-stat-value">{publishedCount}</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-label">Gratuitos</div>
            <div className="admin-stat-value">{freeCount}</div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="admin-filterbar">
          <div className="admin-filterbar-fields">
            <div className="admin-filter-search">
              <span aria-hidden="true">🔍</span>
              <input
                type="search"
                placeholder="Buscar por título..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Buscar producto por título"
              />
            </div>

            <select
              className="admin-filter-select"
              aria-label="Categoría"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">Categorías</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              className="admin-filter-select"
              aria-label="Subcategoría"
              value={subcategoryFilter}
              onChange={(e) => setSubcategoryFilter(e.target.value)}
            >
              <option value="all">Subcategorías</option>
              {SUBCATEGORIES.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>

            <select
              className="admin-filter-select"
              aria-label="Modalidad"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">Modalidades</option>
              <option value="digital">Productos Digitales (Guías, Recetarios)</option>
              <option value="service">Servicios / Asesorías</option>
            </select>

            <select
              className="admin-filter-select"
              aria-label="Estado"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Estados</option>
              <option value="published">Publicados</option>
              <option value="draft">Borradores / Ocultos</option>
            </select>
          </div>

          <div className="admin-filter-meta">
            <span>
              Mostrando <strong>{filteredProducts.length}</strong> de <strong>{products.length}</strong>
            </span>
            {hasActiveFilters && (
              <button type="button" className="admin-filter-reset" onClick={resetFilters}>
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {productsMissingCovers.length > 0 && (
        <div
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '16px 24px',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontSize: '0.92rem', color: 'var(--foreground)' }}>
              {generatingCovers
                ? `Generando portadas… ${coverProgress.done}/${coverProgress.total}`
                : `${productsMissingCovers.length} producto(s) sin portada generada desde su PDF.`}
            </span>
            <button
              type="button"
              onClick={handleGenerateCovers}
              disabled={generatingCovers}
              style={{
                background: 'var(--color-turquoise)',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                padding: '10px 20px',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: generatingCovers ? 'default' : 'pointer',
                opacity: generatingCovers ? 0.7 : 1,
              }}
            >
              {generatingCovers ? 'Generando…' : 'Generar portadas faltantes'}
            </button>
          </div>
          {!generatingCovers && failedCovers.length > 0 && (
            <p style={{ fontSize: '0.85rem', color: 'var(--color-terracotta)', marginTop: '10px' }}>
              No se pudieron generar {failedCovers.length}: {failedCovers.join(', ')}. Puede que el PDF sea muy pesado — vuelve a intentar.
            </p>
          )}
        </div>
      )}

      {/* Grid of Products */}
      {filteredProducts.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 24px',
            background: 'white',
            borderRadius: '16px',
            color: 'var(--foreground)',
            opacity: 0.8,
          }}
        >
          <p style={{ fontSize: '1.1rem', marginBottom: '12px' }}>
            No se encontraron productos con los filtros seleccionados.
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              style={{
                background: 'var(--color-turquoise)',
                color: 'white',
                border: 'none',
                padding: '8px 18px',
                borderRadius: '20px',
                fontSize: '0.88rem',
                cursor: 'pointer',
              }}
            >
              Mostrar todos los productos
            </button>
          )}
        </div>
      ) : (
        <div className="admin-product-grid">
          {filteredProducts.map((product) => (
            <div className="admin-product-card" key={product.id}>
              <div className="admin-product-card-image">
                <div className="admin-product-card-badges">
                  <span className={`admin-badge ${product.is_published ? 'published' : 'draft'}`}>
                    {product.is_published ? 'Publicado' : 'Borrador'}
                  </span>
                  {product.product_type === 'service' && (
                    <span
                      className="admin-badge"
                      style={{ background: 'var(--color-turquoise)', color: 'white', marginLeft: '4px' }}
                    >
                      Servicio
                    </span>
                  )}
                </div>
                {product.cover_image_url ? (
                  <img src={product.cover_image_url} alt={product.title} />
                ) : (
                  <span>{product.title}</span>
                )}
                <DiscountBadge product={product} />
              </div>
              <div className="admin-product-card-body">
                <div className="admin-product-card-title">{product.title}</div>
                <div className="admin-product-card-meta">
                  <span>{product.category}{product.subcategory ? ` · ${product.subcategory}` : ''}</span>
                  {product.price === 0 ? (
                    <span className="admin-badge free">Gratis</span>
                  ) : (
                    <strong><PriceLabel product={product} /></strong>
                  )}
                </div>
                <ProductRowActions product={product} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
