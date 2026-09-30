/**
 * URLs del optimizador de imágenes de Next (/_next/image) para archivos de /public.
 * Sirven la imagen redimensionada y en WebP/AVIF en vez del JPG original.
 * Los anchos deben estar entre los que Next permite por defecto (imageSizes + deviceSizes).
 */
const WIDTHS = [384, 640, 750, 828, 1080] as const;

export function optimizedSrc(src: string, width: number, quality = 75): string {
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`;
}

export function optimizedSrcSet(src: string, quality = 75): string {
  return WIDTHS.map((w) => `${optimizedSrc(src, w, quality)} ${w}w`).join(', ');
}
