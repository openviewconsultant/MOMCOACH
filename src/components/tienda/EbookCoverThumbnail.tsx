'use client';

import React, { useEffect, useState } from 'react';
import { generateAndSaveCover } from '@/lib/render-pdf-cover';

const coverCache = new Map<string, Promise<string | null>>();

function getOrGenerateCover(productId: string): Promise<string | null> {
  let cached = coverCache.get(productId);
  if (!cached) {
    cached = generateAndSaveCover(productId);
    coverCache.set(productId, cached);
  }
  return cached;
}

interface EbookCoverThumbnailProps {
  productId: string;
  coverImageUrl?: string | null;
}

export default function EbookCoverThumbnail({ productId, coverImageUrl }: EbookCoverThumbnailProps) {
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (coverImageUrl) return;
    let cancelled = false;
    getOrGenerateCover(productId).then((url) => {
      if (!cancelled) setGeneratedUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [productId, coverImageUrl]);

  const finalUrl = coverImageUrl || generatedUrl;
  if (!finalUrl) return null;

  return <span className="shop-free-cover-img" style={{ backgroundImage: `url(${finalUrl})` }} />;
}
