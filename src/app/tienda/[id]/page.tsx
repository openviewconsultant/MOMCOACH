import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { formatUSD } from '@/lib/format';
import ProductDetailCTA from '@/components/tienda/ProductDetailCTA';
import VideoPlayer from '@/components/tienda/VideoPlayer';
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
  const features = Array.isArray(p.features) ? p.features : [];
  const isFree = p.price === 0;
  const paragraphs = (p.description || '').split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);
  const details = p.details && Array.isArray(p.details.items) && p.details.items.length > 0 ? p.details : null;

  return (
    <div className="producto-main">
      <div className="producto-topbar">
        <div className="producto-topbar-inner">
          <Link href="/tienda" className="producto-back font-inter">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Volver a la tienda
          </Link>
          {p.category && <span className="producto-breadcrumb font-inter">{p.category}{p.subcategory ? ` · ${p.subcategory}` : ''}</span>}
        </div>
      </div>

      <div className="producto-layout">
        <div className="producto-media">
          {p.video_url ? (
            <VideoPlayer videoUrl={p.video_url} title={p.title} />
          ) : p.cover_image_url ? (
            <div className="producto-cover-wrap">
              <img src={p.cover_image_url} alt={p.title} className="producto-cover" />
            </div>
          ) : (
            <div className="libro-cover-placeholder producto-cover-placeholder">
              <span>{p.title}</span>
            </div>
          )}
        </div>

        <div className="producto-info-card">
          {p.subtitle && <span className="producto-subtitle font-inter">{p.subtitle}</span>}
          <h1 className="producto-title font-fraunces">{p.title}</h1>
          <p className={`producto-price font-fraunces ${isFree ? 'is-free' : ''}`}>
            {isFree ? 'Gratis' : formatUSD(p.price)}
          </p>
          {p.price_note && <p className="producto-price-note font-inter">{p.price_note}</p>}

          {features.length > 0 && (
            <>
              <span className="producto-features-title font-inter">Incluye</span>
              <ul className="producto-features">
                {features.map((feat, idx) => (
                  <li key={idx} className="font-inter">
                    <span aria-hidden="true">✓</span> {feat}
                  </li>
                ))}
              </ul>
            </>
          )}

          <div className="producto-cta">
            <ProductDetailCTA product={p} />
          </div>

          <div className="producto-description font-inter">
            {paragraphs.length > 0
              ? paragraphs.map((para, idx) => <p key={idx}>{para}</p>)
              : <p>{p.description}</p>}
          </div>

          {details && (
            <>
              <span className="producto-features-title font-inter">{details.heading}</span>
              <ul className="producto-features">
                {details.items.map((item, idx) => (
                  <li key={idx} className="font-inter">
                    <span aria-hidden="true">✓</span> {item}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
