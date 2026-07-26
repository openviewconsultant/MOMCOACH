'use client';

import React, { useState } from 'react';
import { useCart } from '@/lib/cart-context';
import { formatCOP } from '@/lib/format';
import './cart-drawer.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CartDrawer() {
  const { items, removeItem, updateQuantity, totalItems, totalPrice } = useCart();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (totalItems === 0 && !open) return null;

  async function handleCheckout() {
    setError(null);
    if (!EMAIL_REGEX.test(email)) {
      setError('Ingresa un correo electrónico válido para recibir tus libros.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/mercadopago/crear-preferencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          items: items.map((item) => ({ id: item.id, quantity: item.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.initPoint) {
        throw new Error(data.error || 'No se pudo iniciar el pago');
      }
      window.location.href = data.initPoint;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar el pago');
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className="cart-fab font-inter"
        onClick={() => setOpen(true)}
        aria-label="Ver carrito de libros"
      >
        🛒 {totalItems > 0 && <span className="cart-fab-badge">{totalItems}</span>}
      </button>

      {open && (
        <div className="cart-drawer-overlay" onClick={() => setOpen(false)}>
          <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="cart-drawer-header">
              <h2 className="font-inter">Tu carrito de libros</h2>
              <button type="button" className="cart-drawer-close" onClick={() => setOpen(false)} aria-label="Cerrar">
                ✕
              </button>
            </div>

            {items.length === 0 ? (
              <p className="cart-drawer-empty font-inter">Aún no has añadido libros.</p>
            ) : (
              <>
                <ul className="cart-drawer-list">
                  {items.map((item) => (
                    <li key={item.id} className="cart-drawer-item">
                      <div className="cart-drawer-item-info">
                        <p className="font-inter">{item.title}</p>
                        <span className="font-inter">{formatCOP(item.price)}</span>
                      </div>
                      <div className="cart-drawer-item-controls">
                        <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                        <span>{item.quantity}</span>
                        <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                        <button type="button" className="cart-drawer-remove" onClick={() => removeItem(item.id)}>
                          Eliminar
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="cart-drawer-total font-inter">
                  <span>Total</span>
                  <strong>{formatCOP(totalPrice)}</strong>
                </div>

                <label className="cart-drawer-email font-inter">
                  Correo para recibir tus libros
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tucorreo@ejemplo.com"
                    required
                  />
                </label>

                {error && <p className="cart-drawer-error font-inter">{error}</p>}

                <button
                  type="button"
                  className="cart-drawer-checkout font-inter"
                  onClick={handleCheckout}
                  disabled={loading}
                >
                  {loading ? 'Redirigiendo a Mercado Pago…' : 'Pagar con Mercado Pago'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
