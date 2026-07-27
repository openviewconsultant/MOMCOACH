import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ProductForm from '../../ProductForm';
import type { Product } from '@/lib/types';

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase.from('products').select('*').eq('id', id).single();

  if (!product) {
    notFound();
  }

  return (
    <div>
      <Link href="/admin/productos" className="admin-back-link">← Volver a productos</Link>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-title font-forum">Editar producto</h1>
          <p className="admin-subtitle">{product.title}</p>
        </div>
      </div>
      <ProductForm product={product as Product} />
    </div>
  );
}
