import React from 'react';
import { formatUSD } from '@/lib/format';
import { discountPercentOf, finalPrice, hasDiscount } from '@/lib/pricing';
import type { Product } from '@/lib/types';
import './discount.css';

type DiscountProduct = Pick<Product, 'price' | 'discount_percent' | 'discount_style'>;

/** Telaraña en la esquina superior derecha: rayos desde la esquina + arcos que "cuelgan". */
function cobwebPaths(): { rays: string; arcs: string } {
  const size = 120;
  const cx = size;
  const cy = 0;
  const angles = [90, 112.5, 135, 157.5, 180].map((a) => (a * Math.PI) / 180);
  const pt = (r: number, a: number) => [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;

  const rays = angles
    .map((a) => {
      const [x, y] = pt(size * 1.05, a);
      return `M${cx} ${cy}L${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join('');

  const arcs = [26, 48, 70, 92]
    .map((r) => {
      let d = '';
      for (let i = 0; i < angles.length - 1; i++) {
        const [x1, y1] = pt(r, angles[i]);
        const [x2, y2] = pt(r, angles[i + 1]);
        const [qx, qy] = pt(r * 0.86, (angles[i] + angles[i + 1]) / 2);
        d += `${i === 0 ? `M${x1.toFixed(1)} ${y1.toFixed(1)}` : ''}Q${qx.toFixed(1)} ${qy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
      }
      return d;
    })
    .join('');

  return { rays, arcs };
}

const WEB = cobwebPaths();

function Cobweb() {
  return (
    <svg className="dc-web" viewBox="0 0 120 120" aria-hidden="true">
      <g fill="none" strokeLinecap="round">
        <path d={WEB.rays + WEB.arcs} stroke="rgba(0,0,0,0.35)" strokeWidth="2.6" />
        <path d={WEB.rays + WEB.arcs} stroke="rgba(255,255,255,0.95)" strokeWidth="1.3" />
      </g>
    </svg>
  );
}

function Spider() {
  return (
    <svg className="dc-spider" viewBox="0 0 40 120" aria-hidden="true">
      <g className="dc-spider-body">
        <line x1="20" y1="-200" x2="20" y2="30" stroke="rgba(255,255,255,0.95)" strokeWidth="1.1" />
        <g stroke="#1b0f24" strokeWidth="1.8" strokeLinecap="round" fill="none">
          <path d="M20 36 L9 30 L3 36" />
          <path d="M20 37 L8 38 L3 46" />
          <path d="M20 39 L9 46 L5 55" />
          <path d="M20 41 L12 52 L10 60" />
          <path d="M20 36 L31 30 L37 36" />
          <path d="M20 37 L32 38 L37 46" />
          <path d="M20 39 L31 46 L35 55" />
          <path d="M20 41 L28 52 L30 60" />
        </g>
        <ellipse cx="20" cy="45" rx="7" ry="9" fill="#1b0f24" />
        <circle cx="20" cy="33" r="5" fill="#1b0f24" />
        <circle cx="18" cy="32" r="1.3" fill="#ff7a1a" />
        <circle cx="22" cy="32" r="1.3" fill="#ff7a1a" />
        <path d="M17 43 q3 3 6 0" stroke="#ff7a1a" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/**
 * Franja de descuento sobre la imagen del producto. El contenedor padre debe
 * tener `position: relative` y `overflow: hidden` (todas las tarjetas lo tienen).
 * Con estilo "halloween" agrega telaraña y una araña que sube por su hilo.
 */
export default function DiscountBadge({ product, onCard = false }: { product: DiscountProduct; onCard?: boolean }) {
  if (!hasDiscount(product)) return null;
  const pct = discountPercentOf(product);
  const halloween = product.discount_style === 'halloween';

  return (
    <div className={`dc-overlay ${halloween ? 'dc-halloween' : 'dc-default'} ${onCard ? 'dc-card' : ''}`} aria-hidden="true">
      {halloween && (
        <>
          <Cobweb />
          <Spider />
        </>
      )}
      <div className="dc-strip">
        <span className="dc-strip-pct">-{pct}%</span>
        <span className="dc-strip-label">{halloween ? '🎃 Halloween' : 'Oferta'}</span>
      </div>
    </div>
  );
}

/** Precio para mostrar en texto: si hay descuento, precio anterior tachado + precio final. */
export function PriceLabel({ product }: { product: DiscountProduct }) {
  if (!hasDiscount(product)) return <>{formatUSD(product.price)}</>;
  return (
    <>
      <span className="dc-old-price">{formatUSD(product.price)}</span> <span className="dc-final">{formatUSD(finalPrice(product))}</span>
    </>
  );
}
