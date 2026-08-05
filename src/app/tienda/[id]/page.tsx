import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getVideoEmbedUrl } from '@/lib/video';
import { formatCOP } from '@/lib/format';
import ProductDetailCTA from '@/components/tienda/ProductDetailCTA';
import type { Product } from '@/lib/types';
import '../tienda.css';
import './producto.css';

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('is_published', true)
    .maybeSingle();

  if (!product) {
    notFound();
  }

  const p = product as Product;
  const embedUrl = p.video_url ? getVideoEmbedUrl(p.video_url) : null;
  const features = Array.isArray(p.features) ? p.features : [];

  return (
    <div className="producto-main">
      <div className="producto-back-section">
        <Link href="/tienda" className="tienda-back font-inter">← Volver a la tienda</Link>
      </div>

      <div className="producto-layout">
        <div className="producto-media">
          {embedUrl ? (
            <div className="producto-video-wrap">
              <iframe
                src={embedUrl}
                title={p.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : p.cover_image_url ? (
            <img src={p.cover_image_url} alt={p.title} className="producto-cover" />
          ) : (
            <div className="libro-cover-placeholder producto-cover-placeholder">
              <span>{p.title}</span>
            </div>
          )}
        </div>

        <div className="producto-info">
          {p.subtitle && <span className="producto-subtitle font-inter">{p.subtitle}</span>}
          <h1 className="producto-title font-forum">{p.title}</h1>
          <p className="producto-price font-forum">{p.price === 0 ? 'Gratis' : formatCOP(p.price)}</p>
          <p className="producto-description font-inter">{p.description}</p>

          {features.length > 0 && (
            <ul className="producto-features">
              {features.map((feat, idx) => (
                <li key={idx} className="font-inter">
                  <span aria-hidden="true">✓</span> {feat}
                </li>
              ))}
            </ul>
          )}

          <div className="producto-cta">
            <ProductDetailCTA product={p} />
          </div>
        </div>
      </div>
    </div>
  );
}
