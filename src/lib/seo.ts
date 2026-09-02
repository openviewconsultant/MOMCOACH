import type { Metadata } from 'next';

// Canonical site URL used to resolve metadataBase, absolute OG/canonical URLs,
// and the sitemap/robots entries. Falls back to the current Vercel deployment
// alias when NEXT_PUBLIC_SITE_URL isn't set (same pattern as lib/mercadopago.ts).
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://momcoach-rho.vercel.app').replace(/\/+$/, '');

export const SITE_NAME = 'The Mom Coach';

// Denisse's portrait, already hosted and reused across /sobre-mi and /contacto —
// serves as the default social-share image for pages without a more specific one.
export const DEFAULT_OG_IMAGE = '/wp-content/uploads/2023/12/DENIS-05.webp';

interface PageMetaOptions {
  title: string;
  description: string;
  /** Site-relative path starting with "/", e.g. "/sueno". Use "/" for the homepage. */
  path: string;
  image?: string;
}

/** Shared per-page metadata builder: fills in canonical + Open Graph + Twitter card. */
export function buildMetadata({ title, description, path, image = DEFAULT_OG_IMAGE }: PageMetaOptions): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${path}`,
      siteName: SITE_NAME,
      locale: 'es_CO',
      type: 'website',
      images: [{ url: image }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}
