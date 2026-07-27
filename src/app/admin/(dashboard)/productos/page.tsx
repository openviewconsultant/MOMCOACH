import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import type { Product } from '@/lib/types';
import ProductRowActions from './ProductRowActions';
import { formatCOP } from '@/lib/format';

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  const items = (products ?? []) as Product[];
  const publishedCount = items.filter((p) => p.is_published).length;
  const freeCount = items.filter((p) => p.price === 0).length;

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-title font-forum">Productos</h1>
          <p className="admin-subtitle">Publica y gestiona los libros y guías de la tienda.</p>
        </div>
        <Link href="/admin/productos/nuevo" className="admin-new-btn">
          + Nuevo producto
        </Link>
      </div>

      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-label">Total de productos</div>
          <div className="admin-stat-value">{items.length}</div>
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

      {items.length === 0 ? (
        <p className="admin-empty">Aún no has creado productos.</p>
      ) : (
        <div className="admin-product-grid">
          {items.map((product) => (
            <div className="admin-product-card" key={product.id}>
              <div className="admin-product-card-image">
                <div className="admin-product-card-badges">
                  <span className={`admin-badge ${product.is_published ? 'published' : 'draft'}`}>
                    {product.is_published ? 'Publicado' : 'Borrador'}
                  </span>
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
