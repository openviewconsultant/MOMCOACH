'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/admin/login');
}

export interface ProductFormState {
  error: string | null;
}

export async function saveProductAction(
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Sesión expirada. Vuelve a iniciar sesión.' };
  }

  const id = formData.get('id') as string | null;
  const title = (formData.get('title') as string | null)?.trim();
  const description = (formData.get('description') as string | null)?.trim() ?? '';
  const priceRaw = formData.get('price') as string | null;
  const category = (formData.get('category') as string | null)?.trim() || 'Libros';
  const isPublished = formData.get('is_published') === 'on';
  const coverImageUrl = (formData.get('cover_image_url') as string | null) || null;
  const filePath = (formData.get('file_path') as string | null) || null;

  const productType = (formData.get('product_type') as string | null) || 'digital';
  const subtitle = (formData.get('subtitle') as string | null)?.trim() || null;
  const featuresRaw = (formData.get('features') as string | null)?.trim() || '';
  const features = featuresRaw
    ? featuresRaw.split('\n').map((line) => line.trim()).filter(Boolean)
    : [];
  const isPopular = formData.get('is_popular') === 'on';
  const whatsappText = (formData.get('whatsapp_text') as string | null)?.trim() || null;

  if (!title) {
    return { error: 'El título es obligatorio' };
  }

  const price = Number(priceRaw);
  if (!Number.isFinite(price) || price < 0 || !Number.isInteger(price)) {
    return { error: 'El precio debe ser un número entero mayor o igual a 0' };
  }

  const payload = {
    title,
    description,
    price,
    category,
    product_type: productType,
    subtitle,
    features,
    is_popular: isPopular,
    whatsapp_text: whatsappText,
    is_published: isPublished,
    cover_image_url: coverImageUrl,
    file_path: filePath,
  };

  const { error } = id
    ? await supabase.from('products').update(payload).eq('id', id)
    : await supabase.from('products').insert(payload);

  if (error) {
    console.error('Error guardando producto', error);
    return { error: 'No se pudo guardar el producto' };
  }

  revalidatePath('/admin/productos');
  revalidatePath('/tienda');
  revalidatePath('/alimentacion');
  revalidatePath('/sueno');
  redirect('/admin/productos');
}

export async function deleteProductAction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) {
    console.error('Error eliminando producto', error);
    return;
  }
  revalidatePath('/admin/productos');
  revalidatePath('/tienda');
}

export async function togglePublishAction(id: string, nextValue: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('products')
    .update({ is_published: nextValue })
    .eq('id', id);
  if (error) {
    console.error('Error cambiando publicación del producto', error);
    return;
  }
  revalidatePath('/admin/productos');
  revalidatePath('/tienda');
}
