import { NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import { createAdminClient } from '@/lib/supabase/admin';

export const maxDuration = 60;

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  const supabase = createAdminClient();
  const { data: product, error } = await supabase
    .from('products')
    .select('is_published, file_path')
    .eq('id', id)
    .single();

  if (error || !product || !product.is_published || !product.file_path) {
    return NextResponse.json({ error: 'Producto no disponible' }, { status: 404 });
  }

  const { data: file, error: downloadError } = await supabase.storage
    .from('productos')
    .download(product.file_path);

  if (downloadError || !file) {
    console.error('Error descargando PDF para portada', downloadError);
    return NextResponse.json({ error: 'No se pudo cargar la portada' }, { status: 500 });
  }

  let coverBytes: Uint8Array;
  try {
    const sourceBytes = await file.arrayBuffer();
    const sourceDoc = await PDFDocument.load(sourceBytes, { ignoreEncryption: true, updateMetadata: false });

    const coverDoc = await PDFDocument.create();
    const [firstPage] = await coverDoc.copyPages(sourceDoc, [0]);
    coverDoc.addPage(firstPage);

    coverBytes = await coverDoc.save();
  } catch (err) {
    console.error('Error procesando PDF para portada', product.file_path, err);
    return NextResponse.json({ error: 'No se pudo procesar el PDF' }, { status: 500 });
  }

  return new NextResponse(Buffer.from(coverBytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="portada.pdf"',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
