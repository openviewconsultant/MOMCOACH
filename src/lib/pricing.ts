import type { Product } from '@/lib/types';

type Priced = Pick<Product, 'price' | 'discount_percent'>;

export const MAX_DISCOUNT_PERCENT = 90;

/** Porcentaje de descuento válido (entero 0–90). Los productos gratis no tienen descuento. */
export function discountPercentOf(product: Priced): number {
  const raw = Number(product.discount_percent ?? 0);
  if (!Number.isFinite(raw) || product.price <= 0) return 0;
  return Math.min(MAX_DISCOUNT_PERCENT, Math.max(0, Math.round(raw)));
}

export function hasDiscount(product: Priced): boolean {
  return discountPercentOf(product) > 0;
}

/**
 * Precio que realmente se cobra (USD, 2 decimales). Es la única fuente de
 * verdad: la usan la tienda, el carrito y el checkout del servidor.
 */
export function finalPrice(product: Priced): number {
  const pct = discountPercentOf(product);
  if (pct === 0) return product.price;
  return Math.round(product.price * (100 - pct)) / 100;
}
