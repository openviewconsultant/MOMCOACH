import { NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import { createAdminClient } from '@/lib/supabase/admin';

// Sharp pages are rendered normally on the client; anything beyond that up to
// this limit is still sent so it can be rendered blurred as a teaser.
const PREVIEW_PAGE_LIMIT = 8;

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

  const { data: file, error: downloadError } = await supabase.storage
    .from('productos')
    .download(product.file_path);

  if (downloadError || !file) {
    console.error('Error descargando PDF para vista previa', downloadError);
    return NextResponse.json({ error: 'No se pudo cargar la vista previa' }, { status: 500 });
  }

  const sourceBytes = await file.arrayBuffer();
  const sourceDoc = await PDFDocument.load(sourceBytes);
  const pageCount = Math.min(PREVIEW_PAGE_LIMIT, sourceDoc.getPageCount());

  const previewDoc = await PDFDocument.create();
  const copiedPages = await previewDoc.copyPages(sourceDoc, Array.from({ length: pageCount }, (_, i) => i));
  copiedPages.forEach((page) => previewDoc.addPage(page));

  const previewBytes = await previewDoc.save();

  return new NextResponse(Buffer.from(previewBytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="vista-previa.pdf"',
      'Cache-Control': 'private, max-age=300',
    },
  });
}
