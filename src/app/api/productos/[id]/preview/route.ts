import { NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import { createAdminClient } from '@/lib/supabase/admin';

// Sharp pages are rendered normally on the client; anything beyond that up to
// this limit is still sent so it can be rendered blurred as a teaser.
const PREVIEW_PAGE_LIMIT = 8;

export const maxDuration = 60;

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

  if (error || !product || !product.is_published || !product.file_path) {
    return NextResponse.json({ error: 'Producto no disponible' }, { status: 404 });
  }

  const { data: file, error: downloadError } = await supabase.storage
    .from('productos')
    .download(product.file_path);

  if (downloadError || !file) {
    console.error('Error descargando PDF para vista previa', downloadError);
    return NextResponse.json({ error: 'No se pudo cargar la vista previa' }, { status: 500 });
  }

  let previewBytes: Uint8Array;
  try {
    const sourceBytes = await file.arrayBuffer();
    const sourceDoc = await PDFDocument.load(sourceBytes, { ignoreEncryption: true, updateMetadata: false });
    const pageCount = Math.min(PREVIEW_PAGE_LIMIT, sourceDoc.getPageCount());

    const previewDoc = await PDFDocument.create();
    const copiedPages = await previewDoc.copyPages(sourceDoc, Array.from({ length: pageCount }, (_, i) => i));
    copiedPages.forEach((page) => previewDoc.addPage(page));

    previewBytes = await previewDoc.save();
  } catch (err) {
    console.error('Error procesando PDF para vista previa', product.file_path, err);
    return NextResponse.json({ error: 'No se pudo procesar el PDF' }, { status: 500 });
  }

  return new NextResponse(Buffer.from(previewBytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="vista-previa.pdf"',
      'Cache-Control': 'private, max-age=300',
    },
  });
}
