import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const DOWNLOAD_LINK_TTL_SECONDS = 60 * 60 * 48; // 48 horas

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  const supabase = createAdminClient();
  const { data: product, error } = await supabase
    .from('products')
    .select('price, is_published, file_path')
    .eq('id', id)
    .single();

  if (error || !product || !product.is_published || product.price > 0 || !product.file_path) {
    return NextResponse.json({ error: 'Producto no disponible' }, { status: 404 });
  }

  const { data: signed, error: signError } = await supabase.storage
    .from('productos')
    .createSignedUrl(product.file_path, DOWNLOAD_LINK_TTL_SECONDS);

  if (signError || !signed) {
    console.error('Error generando enlace firmado gratuito', signError);
    return NextResponse.json({ error: 'No se pudo generar el enlace de descarga' }, { status: 500 });
  }

  return NextResponse.redirect(signed.signedUrl);
}
