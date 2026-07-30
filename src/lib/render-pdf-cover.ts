let workerConfigured = false;

async function getPdfjs() {
  const pdfjsLib = await import('pdfjs-dist');
  if (!workerConfigured) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
    workerConfigured = true;
  }
  return pdfjsLib;
}

/** Renders page 1 of the PDF at `fileUrl` to a JPEG data URL, sized for a card cover. */
export async function renderPdfCoverDataUrl(fileUrl: string, scale = 0.55): Promise<string | null> {
  try {
    const pdfjsLib = await getPdfjs();
    const pdf = await pdfjsLib.getDocument({ url: fileUrl }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    await page.render({ canvas, canvasContext: ctx, viewport }).promise;
    return canvas.toDataURL('image/jpeg', 0.7);
  } catch (err) {
    console.error('No se pudo renderizar la portada del PDF', err);
    return null;
  }
}

export function dataUrlToBlob(dataUrl: string): Blob {
  const [meta, base64] = dataUrl.split(',');
  const mime = meta.match(/:(.*?);/)?.[1] || 'image/jpeg';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

/** Renders and persists the cover for a product; returns the final public URL (or null on failure). */
export async function generateAndSaveCover(productId: string): Promise<string | null> {
  const dataUrl = await renderPdfCoverDataUrl(`/api/productos/${productId}/cover-source`);
  if (!dataUrl) return null;

  try {
    const blob = dataUrlToBlob(dataUrl);
    const res = await fetch(`/api/productos/${productId}/cover`, {
      method: 'POST',
      headers: { 'Content-Type': 'image/jpeg' },
      body: blob,
    });
    if (!res.ok) return dataUrl;
    const json = await res.json();
    return json.url || dataUrl;
  } catch (err) {
    console.error('No se pudo guardar la portada generada', err);
    return dataUrl;
  }
}
