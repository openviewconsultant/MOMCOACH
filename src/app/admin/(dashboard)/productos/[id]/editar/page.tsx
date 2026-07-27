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
      <h1 className="admin-title font-forum">Editar producto</h1>
      <ProductForm product={product as Product} />
    </div>
  );
}
