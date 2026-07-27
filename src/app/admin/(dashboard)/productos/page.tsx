import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import type { Product } from '@/lib/types';
import AdminProductsList from './AdminProductsList';

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
          <p className="admin-subtitle">Publica y gestiona los libros, guías y servicios de la tienda.</p>
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

      <AdminProductsList products={items} />
    </div>
  );
}
