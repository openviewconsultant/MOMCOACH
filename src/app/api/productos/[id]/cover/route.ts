import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const MAX_COVER_BYTES = 1.5 * 1024 * 1024; // 1.5MB safety cap

export async function POST(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  const supabase = createAdminClient();
  const { data: product, error } = await supabase
    .from('products')
    .select('is_published, file_path, cover_image_url')
    .eq('id', id)
    .single();

  if (error || !product || !product.is_published || !product.file_path) {
    return NextResponse.json({ error: 'Producto no disponible' }, { status: 404 });
  }

  if (product.cover_image_url) {
    return NextResponse.json({ url: product.cover_image_url });
  }

  const contentType = request.headers.get('content-type') || '';
  if (!contentType.startsWith('image/')) {
    return NextResponse.json({ error: 'Tipo de contenido inválido' }, { status: 400 });
  }

  const bytes = await request.arrayBuffer();
  if (bytes.byteLength === 0 || bytes.byteLength > MAX_COVER_BYTES) {
    return NextResponse.json({ error: 'Imagen inválida' }, { status: 400 });
  }

  const path = `auto/${id}.jpg`;
  const { error: uploadError } = await supabase.storage
    .from('portadas')
    .upload(path, Buffer.from(bytes), { upsert: true, contentType: 'image/jpeg' });

  if (uploadError) {
    console.error('Error subiendo portada generada', uploadError);
    return NextResponse.json({ error: 'No se pudo guardar la portada' }, { status: 500 });
  }

  const { data: publicUrlData } = supabase.storage.from('portadas').getPublicUrl(path);
  const url = publicUrlData.publicUrl;

  const { error: updateError } = await supabase
    .from('products')
    .update({ cover_image_url: url })
    .eq('id', id)
    .is('cover_image_url', null);

  if (updateError) {
    console.error('Error guardando cover_image_url', updateError);
    return NextResponse.json({ error: 'No se pudo guardar la portada' }, { status: 500 });
  }

  return NextResponse.json({ url });
}
