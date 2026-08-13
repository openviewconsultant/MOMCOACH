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

  return <AdminProductsList products={items} />;
}
