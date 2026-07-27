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

  return (
    <div>
      <h1 className="admin-title font-forum">Productos</h1>
      <Link href="/admin/productos/nuevo" className="admin-new-btn">
        + Nuevo producto
      </Link>

      {items.length === 0 ? (
        <p className="admin-empty">Aún no has creado productos.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((product) => (
              <tr key={product.id}>
                <td>{product.title}</td>
                <td>{product.category}</td>
                <td>
                  {product.price === 0 ? (
                    <span className="admin-badge free">Gratis</span>
                  ) : (
                    formatCOP(product.price)
                  )}
                </td>
                <td>
                  <span className={`admin-badge ${product.is_published ? 'published' : 'draft'}`}>
                    {product.is_published ? 'Publicado' : 'Borrador'}
                  </span>
                </td>
                <td>
                  <ProductRowActions product={product} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
