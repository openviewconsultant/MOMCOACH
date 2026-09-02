'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

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
  const category = (formData.get('category') as string | null)?.trim() || 'Alimentación';
  const subcategory = (formData.get('subcategory') as string | null)?.trim() || null;
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
  const paymentProviderRaw = (formData.get('payment_provider') as string | null) || 'mercadopago';
  const paymentProvider = paymentProviderRaw === 'hotmart' ? 'hotmart' : 'mercadopago';
  const hotmartUrl = (formData.get('hotmart_url') as string | null)?.trim() || null;
  const videoUrl = (formData.get('video_url') as string | null)?.trim() || null;
  const bookingCalendarId = (formData.get('booking_calendar_id') as string | null)?.trim() || null;

  if (!title) {
    return { error: 'El título es obligatorio' };
  }

  const price = Number(priceRaw);
  if (!Number.isFinite(price) || price < 0 || !Number.isInteger(price)) {
    return { error: 'El precio debe ser un número entero mayor o igual a 0' };
  }

  if (price > 0 && paymentProvider === 'hotmart' && !hotmartUrl) {
    return { error: 'Ingresa el link de checkout de Hotmart' };
  }

  const payload = {
    title,
    description,
    price,
    category,
    subcategory,
    product_type: productType,
    subtitle,
    features,
    is_popular: isPopular,
    whatsapp_text: whatsappText,
    payment_provider: price > 0 ? paymentProvider : 'mercadopago',
    hotmart_url: price > 0 && paymentProvider === 'hotmart' ? hotmartUrl : null,
    booking_calendar_id: productType === 'service' ? bookingCalendarId : null,
    video_url: videoUrl,
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

  revalidatePath('/');
  revalidatePath('/admin/productos');
  revalidatePath('/tienda');
  if (id) revalidatePath(`/tienda/${id}`);
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
  revalidatePath('/');
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
  revalidatePath('/');
  revalidatePath('/admin/productos');
  revalidatePath('/tienda');
}

export interface BlogPostFormState {
  error: string | null;
}

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function saveBlogPostAction(
  _prevState: BlogPostFormState,
  formData: FormData
): Promise<BlogPostFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Sesión expirada. Vuelve a iniciar sesión.' };
  }

  const id = formData.get('id') as string | null;
  const title = (formData.get('title') as string | null)?.trim();
  const slugInput = (formData.get('slug') as string | null)?.trim();
  const category = (formData.get('category') as string | null)?.trim() || 'Crianza';
  const excerpt = (formData.get('excerpt') as string | null)?.trim() ?? '';
  const content = (formData.get('content') as string | null)?.trim() ?? '';
  const readMinutesRaw = formData.get('read_minutes') as string | null;
  const coverImageUrl = (formData.get('cover_image_url') as string | null) || null;
  const isPublished = formData.get('is_published') === 'on';

  if (!title) {
    return { error: 'El título es obligatorio' };
  }

  const slug = slugify(slugInput || title);
  if (!slug) {
    return { error: 'No se pudo generar un slug válido a partir del título' };
  }

  const readMinutes = Number(readMinutesRaw);

  const payload = {
    title,
    slug,
    category,
    excerpt,
    content,
    read_minutes: Number.isFinite(readMinutes) && readMinutes > 0 ? Math.round(readMinutes) : 5,
    cover_image_url: coverImageUrl,
    is_published: isPublished,
  };

  const { error } = id
    ? await supabase.from('blog_posts').update(payload).eq('id', id)
    : await supabase.from('blog_posts').insert(payload);

  if (error) {
    console.error('Error guardando artículo', error);
    if (error.code === '23505') {
      return { error: 'Ya existe un artículo con ese slug. Cambia el título o el slug.' };
    }
    return { error: 'No se pudo guardar el artículo' };
  }

  revalidatePath('/admin/blog');
  revalidatePath('/blog');
  redirect('/admin/blog');
}

export async function deleteBlogPostAction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('blog_posts').delete().eq('id', id);
  if (error) {
    console.error('Error eliminando artículo', error);
    return;
  }
  revalidatePath('/admin/blog');
  revalidatePath('/blog');
}

export async function togglePublishBlogAction(id: string, nextValue: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('blog_posts')
    .update({ is_published: nextValue })
    .eq('id', id);
  if (error) {
    console.error('Error cambiando publicación del artículo', error);
    return;
  }
  revalidatePath('/admin/blog');
  revalidatePath('/blog');
}

// La tabla `bookings` solo tiene una política RLS de lectura para
// autenticados (ver bookings_migration.sql); para borrar se usa el cliente
// con service role, igual que el resto del código que escribe citas.
export async function deleteBookingsAction(ids: string[]) {
  if (ids.length === 0) return;
  const supabase = createAdminClient();
  const { error } = await supabase.from('bookings').delete().in('id', ids);
  if (error) {
    console.error('Error eliminando citas', error);
    return;
  }
  revalidatePath('/admin/calendario');
}

export async function deleteAllBookingsAction() {
  const supabase = createAdminClient();
  const { error } = await supabase.from('bookings').delete().not('id', 'is', null);
  if (error) {
    console.error('Error eliminando todas las citas', error);
    return;
  }
  revalidatePath('/admin/calendario');
}

/** Elimina pedidos (y sus items/redenciones/citas asociados). */
export async function deleteOrdersAction(ids: string[]) {
  if (!ids || ids.length === 0) return;
  const supabase = createAdminClient();
  await supabase.from('order_items').delete().in('order_id', ids);
  await supabase.from('gift_card_redemptions').delete().in('order_id', ids);
  await supabase.from('bookings').delete().in('order_id', ids);
  await supabase.from('gift_cards').update({ order_id: null }).in('order_id', ids);
  const { error } = await supabase.from('orders').delete().in('id', ids);
  if (error) {
    console.error('Error eliminando pedidos', error);
    return;
  }
  revalidatePath('/admin/pedidos');
}

/** Elimina TODO el historial de pedidos. */
export async function deleteAllOrdersAction() {
  const supabase = createAdminClient();
  await supabase.from('order_items').delete().not('id', 'is', null);
  await supabase.from('gift_card_redemptions').delete().not('id', 'is', null);
  await supabase.from('bookings').delete().not('order_id', 'is', null);
  await supabase.from('gift_cards').update({ order_id: null }).not('order_id', 'is', null);
  const { error } = await supabase.from('orders').delete().not('id', 'is', null);
  if (error) {
    console.error('Error eliminando todos los pedidos', error);
    return;
  }
  revalidatePath('/admin/pedidos');
}
