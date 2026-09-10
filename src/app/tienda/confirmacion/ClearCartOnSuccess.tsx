'use client';

import { useEffect } from 'react';
import { useCart } from '@/lib/cart-context';

/**
 * Al llegar a la página de confirmación tras volver de Mercado Pago, vacía el
 * carrito — salvo que el pago haya sido rechazado, en cuyo caso se conserva
 * para que la persona pueda reintentar sin volver a armarlo.
 */
export default function ClearCartOnSuccess({ rejected }: { rejected: boolean }) {
  const { clear } = useCart();
  useEffect(() => {
    if (!rejected) clear();
  }, [rejected, clear]);
  return null;
}
