'use client';

import React, { useEffect, useRef } from 'react';
import Button from '../ui/Button';
import type { Product as SupabaseProduct } from '@/lib/types';
import './sections.css';

interface ShopProps {
  products?: SupabaseProduct[];
}

const fallbackProducts = [
  {
    title: 'Guía: Cómo Solucionar las Siestas Cortas',
    price: 'USD $16',
    img: '/wp-content/uploads/2021/03/siestascortas.webp',
  },
  {
    title: 'Gift Card',
    price: 'USD $25–USD $200',
    img: '/wp-content/uploads/2024/01/Tarjeta-de-regalo-TMC-PRODUCT-600x600.jpg',
  },
  {
    title: 'Guía: Todo lo que debes saber sobre los Picky Eaters',
    price: 'USD $32',
    img: '/wp-content/uploads/2024/10/picky-eaters-guia-portada-600x600.png',
  },
  {
    title: 'Recetario Booster Calórico',
    price: 'USD $16',
    img: '/wp-content/uploads/2024/03/Portada-recetario-Booster-600x600.png',
  },
  {
    title: 'Guía: Cómo manejar las Regresiones de Sueño',
    price: 'USD $16',
    img: '/wp-content/uploads/2024/01/regresionessueno.webp',
  },
  {
    title: 'Recetario - The Mom Coach',
    price: 'USD $18',
    img: '/wp-content/uploads/2024/01/Imagen-principal-recetario--600x600.jpg',
  },
  {
    title: 'Guía: Transición de Siestas',
    price: 'USD $16',
    img: '/wp-content/uploads/2024/01/transicionsiestas.webp',
  },
  {
    title: 'Recetario: Postres Saludables',
    price: 'USD $10',
    img: '/wp-content/uploads/2024/01/Captura-de-Pantalla-2024-01-25-a-las-8.39.56-p.-m-600x600.png',
  },
];

export default function Shop({ products: featuredProducts }: ShopProps) {
  const products = featuredProducts && featuredProducts.length > 0
    ? featuredProducts.map((p) => ({
        title: p.title,
        price: p.price === 0 ? 'Gratis' : `USD $${p.price}`,
        img: p.cover_image_url || '',
      }))
    : fallbackProducts;

  // Duplicated once so the auto-scroll can loop seamlessly.
  const loopProducts = [...products, ...products];

  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let rafId: number;
    const speed = 0.4; // px per frame

    const step = () => {
      if (!pausedRef.current) {
        const halfway = track.scrollWidth / 2;
        if (track.scrollLeft >= halfway) {
          track.scrollLeft -= halfway;
        }
        track.scrollLeft += speed;
      }
      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const pause = () => { pausedRef.current = true; };
  const resume = () => { pausedRef.current = false; };

  const scroll = (direction: 'left' | 'right') => {
    const el = trackRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
    pause();
    window.setTimeout(resume, 2500);
  };

  return (
    <section id="shop" className="section shop-section">
      <div className="shop-layout">
        <div className="shop-intro">
          <p className="shop-eyebrow font-inter">Los más vendidos</p>
          <h2 className="shop-heading font-fraunces">Productos Premium</h2>
          <p className="shop-description font-inter">
            Quiero compartir mis consejos contigo. La maternidad puede ser maravillosa si entre mamás nos damos una mano.
          </p>
          <Button variant="primary" href="/tienda">Ver Todos</Button>
        </div>

        <div className="shop-carousel">
          <div
            className="shop-track"
            ref={trackRef}
            onMouseEnter={pause}
            onMouseLeave={resume}
            onTouchStart={pause}
            onTouchEnd={resume}
          >
            {loopProducts.map((product, idx) => (
              <a href="/tienda" className="shop-card" key={idx}>
                <div className="shop-card-image">
                  {product.img ? (
                    <img src={product.img} alt={product.title} loading="lazy" />
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', padding: '8px', fontSize: '0.8rem' }}>
                      {product.title}
                    </span>
                  )}
                </div>
                <h3 className="shop-card-title font-inter">{product.title}</h3>
                <p className="shop-card-price font-inter">{product.price}</p>
              </a>
            ))}
          </div>

          <div className="shop-carousel-controls">
            <button onClick={() => scroll('left')} className="shop-arrow" aria-label="Anterior">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button onClick={() => scroll('right')} className="shop-arrow" aria-label="Siguiente">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
