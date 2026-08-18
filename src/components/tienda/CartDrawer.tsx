'use client';

import React, { useState } from 'react';
import { useCart } from '@/lib/cart-context';
import { formatCOP } from '@/lib/format';
import './cart-drawer.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CartDrawer() {
  const { items, removeItem, updateQuantity, totalPrice, isCartOpen, closeCart } = useCart();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isCartOpen) return null;

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
      let data: { initPoint?: string; error?: string } = {};
      try {
        data = await res.json();
      } catch {
        // El servidor no devolvió JSON (p. ej. una caída inesperada de la función).
      }
      if (!res.ok || !data.initPoint) {
        throw new Error(data.error || 'No se pudo iniciar el pago. Intenta nuevamente en unos minutos.');
      }
      window.location.href = data.initPoint;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar el pago');
      setLoading(false);
    }
  }

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="cart-drawer-overlay" onClick={closeCart}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="cart-drawer-header">
          <div className="cart-drawer-header-title">
            <span className="cart-drawer-header-icon" aria-hidden="true">🛍️</span>
            <div>
              <h2 className="font-inter">Tu carrito</h2>
              {itemCount > 0 && (
                <span className="cart-drawer-header-count font-inter">
                  {itemCount} {itemCount === 1 ? 'libro' : 'libros'}
                </span>
              )}
            </div>
          </div>
          <button type="button" className="cart-drawer-close" onClick={closeCart} aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div className="cart-drawer-body">
          {items.length === 0 ? (
            <div className="cart-drawer-empty">
              <span className="cart-drawer-empty-icon" aria-hidden="true">📚</span>
              <p className="font-inter">Aún no has añadido libros.</p>
              <span className="cart-drawer-empty-hint font-inter">Explora la tienda y agrega tus favoritos</span>
            </div>
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
                      <div className="cart-drawer-stepper">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label="Disminuir cantidad"
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label="Aumentar cantidad"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        className="cart-drawer-remove"
                        onClick={() => removeItem(item.id)}
                        aria-label={`Eliminar ${item.title}`}
                      >
                        Eliminar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-drawer-footer">
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
          </div>
        )}
      </div>
    </div>
  );
}
