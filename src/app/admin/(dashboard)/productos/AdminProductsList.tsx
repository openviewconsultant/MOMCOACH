'use client';

import React, { useMemo, useState } from 'react';
import type { Product } from '@/lib/types';
import ProductRowActions from './ProductRowActions';
import { formatCOP } from '@/lib/format';

const PREDEFINED_CATEGORIES = [
  'Alimentación',
  'Sueño infantil',
  'Gratuitos',
  'Tarjeta de regalo',
  'Libros',
];

interface AdminProductsListProps {
  products: Product[];
}

export default function AdminProductsList({ products }: AdminProductsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

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

      // Category filter
      if (categoryFilter !== 'all' && product.category !== categoryFilter) {
        return false;
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
  }, [products, searchTerm, categoryFilter, typeFilter, statusFilter]);

  const hasActiveFilters = searchTerm !== '' || categoryFilter !== 'all' || typeFilter !== 'all' || statusFilter !== 'all';

  function resetFilters() {
    setSearchTerm('');
    setCategoryFilter('all');
    setTypeFilter('all');
    setStatusFilter('all');
  }

  return (
    <div>
      {/* Filter Toolbar */}
      <div
        style={{
          background: 'white',
          borderRadius: '16px',
          padding: '20px 24px',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '28px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', flex: 1, minWidth: '280px' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <span
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                opacity: 0.5,
                fontSize: '0.9rem',
              }}
            >
              🔍
            </span>
            <input
              type="text"
              placeholder="Buscar por título..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: '10px',
                border: '1px solid rgba(0,0,0,0.12)',
                fontSize: '0.9rem',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              padding: '9px 14px',
              borderRadius: '10px',
              border: '1px solid rgba(0,0,0,0.12)',
              fontSize: '0.88rem',
              background: 'white',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <option value="all">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Product Type / Modality Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{
              padding: '9px 14px',
              borderRadius: '10px',
              border: '1px solid rgba(0,0,0,0.12)',
              fontSize: '0.88rem',
              background: 'white',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <option value="all">Todas las modalidades</option>
            <option value="digital">Productos Digitales (Guías, Recetarios)</option>
            <option value="service">Servicios / Asesorías</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '9px 14px',
              borderRadius: '10px',
              border: '1px solid rgba(0,0,0,0.12)',
              fontSize: '0.88rem',
              background: 'white',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <option value="all">Todos los estados</option>
            <option value="published">Publicados</option>
            <option value="draft">Borradores / Ocultos</option>
          </select>
        </div>

        {/* Counter and Reset */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--foreground)', opacity: 0.75 }}>
            Mostrando <strong>{filteredProducts.length}</strong> de <strong>{products.length}</strong>
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              style={{
                background: 'rgba(0,0,0,0.06)',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                color: 'var(--color-blue-gray)',
                fontWeight: 500,
              }}
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

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
              </div>
              <div className="admin-product-card-body">
                <div className="admin-product-card-title">{product.title}</div>
                <div className="admin-product-card-meta">
                  <span>{product.category}</span>
                  {product.price === 0 ? (
                    <span className="admin-badge free">Gratis</span>
                  ) : (
                    <strong>{formatCOP(product.price)}</strong>
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
