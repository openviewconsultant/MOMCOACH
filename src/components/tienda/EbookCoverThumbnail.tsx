'use client';

import React, { useEffect, useState } from 'react';

const coverCache = new Map<string, Promise<string | null>>();

async function renderCover(productId: string): Promise<string | null> {
  try {
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

    const pdf = await pdfjsLib.getDocument({ url: `/api/productos/${productId}/preview` }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 0.7 });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    await page.render({ canvas, canvasContext: ctx, viewport }).promise;
    return canvas.toDataURL('image/jpeg', 0.72);
  } catch (err) {
    console.error('No se pudo generar la portada del ebook', err);
    return null;
  }
}

function getCover(productId: string): Promise<string | null> {
  let cached = coverCache.get(productId);
  if (!cached) {
    cached = renderCover(productId);
    coverCache.set(productId, cached);
  }
  return cached;
}

interface EbookCoverThumbnailProps {
  productId: string;
}

export default function EbookCoverThumbnail({ productId }: EbookCoverThumbnailProps) {
  const [coverUrl, setCoverUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getCover(productId).then((url) => {
      if (!cancelled) setCoverUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  if (!coverUrl) return null;

  return <span className="shop-free-cover-img" style={{ backgroundImage: `url(${coverUrl})` }} />;
}
