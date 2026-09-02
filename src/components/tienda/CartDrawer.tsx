'use client';

import React, { useEffect, useState } from 'react';
import { useCart } from '@/lib/cart-context';
import { formatUSD } from '@/lib/format';
import './cart-drawer.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface AppliedGiftCard {
  code: string;
  programLabel: string;
  balance: number;
  discount: number;
}

export default function CartDrawer() {
  const { items, removeItem, updateQuantity, totalPrice, isCartOpen, closeCart, checkoutEmail } = useCart();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showGiftCard, setShowGiftCard] = useState(false);
  const [giftCode, setGiftCode] = useState('');
  const [giftLoading, setGiftLoading] = useState(false);
  const [giftError, setGiftError] = useState<string | null>(null);
  const [applied, setApplied] = useState<AppliedGiftCard | null>(null);

  // Si cambia el carrito, revalidamos / limpiamos la gift card aplicada
  // (el descuento depende de los productos elegibles del carrito).
  useEffect(() => {
    if (!applied) return;
    setApplied(null);
    setGiftError('El carrito cambió. Vuelve a aplicar tu gift card.');
  }, [items]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isCartOpen) return null;

  // Si al agendar una asesoría ya se ingresó el correo, se usa aquí por defecto.
  const effectiveEmail = email || checkoutEmail;

  async function handleApplyGiftCard() {
    setGiftError(null);
    if (!giftCode.trim()) {
      setGiftError('Escribe el código de tu gift card.');
      return;
    }
    setGiftLoading(true);
    try {
      const res = await fetch('/api/gift-cards/validar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: giftCode,
          items: items.map((item) => ({ id: item.id, quantity: item.quantity })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'No se pudo aplicar la gift card');
      setApplied({
        code: data.code,
        programLabel: data.programLabel,
        balance: data.balance,
        discount: data.discount,
      });
      setGiftError(null);
    } catch (err) {
      setApplied(null);
      setGiftError(err instanceof Error ? err.message : 'No se pudo aplicar la gift card');
    } finally {
      setGiftLoading(false);
    }
  }

  function removeGiftCard() {
    setApplied(null);
    setGiftCode('');
    setGiftError(null);
  }

  async function handleCheckout() {
    setError(null);
    if (!EMAIL_REGEX.test(effectiveEmail)) {
      setError('Ingresa un correo electrónico válido.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/mercadopago/crear-preferencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: effectiveEmail,
          items: items.map((item) => ({
            id: item.id,
            quantity: item.quantity,
            ...(item.booking
              ? { booking: { start: item.booking.start, end: item.booking.end, name: item.booking.buyerName } }
              : {}),
          })),
          ...(applied ? { giftCardCode: applied.code } : {}),
        }),
      });
      let data: { initPoint?: string; error?: string } = {};
      try {
        data = await res.json();
      } catch {
        /* respuesta no-JSON */
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
  const discount = applied?.discount ?? 0;
  const finalTotal = Math.max(0, totalPrice - discount);

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
                  {itemCount} {itemCount === 1 ? 'artículo' : 'artículos'}
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
              <p className="font-inter">Aún no has añadido nada.</p>
              <span className="cart-drawer-empty-hint font-inter">Explora la tienda y agrega tus favoritos</span>
            </div>
          ) : (
            <ul className="cart-drawer-list">
              {items.map((item) => (
                <li key={item.id} className="cart-drawer-item">
                  <div className="cart-drawer-item-info">
                    <p className="font-inter">{item.title}</p>
                    <span className="font-inter">{formatUSD(item.price)}</span>
                  </div>
                  {item.booking && (
                    <p className="cart-drawer-item-booking font-inter">📅 {item.booking.label}</p>
                  )}
                  <div className="cart-drawer-item-controls">
                    {item.booking ? (
                      <span className="cart-drawer-item-qty-fixed font-inter">Cita · 1</span>
                    ) : (
                      <div className="cart-drawer-stepper">
                        <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label="Disminuir cantidad">
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="Aumentar cantidad">
                          +
                        </button>
                      </div>
                    )}
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
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-drawer-footer">
            {/* Gift card */}
            {applied ? (
              <div className="cart-gift-applied font-inter">
                <div>
                  <strong>Gift card aplicada</strong>
                  <span>
                    {applied.code} · {applied.programLabel}
                  </span>
                </div>
                <button type="button" onClick={removeGiftCard} aria-label="Quitar gift card">
                  Quitar
                </button>
              </div>
            ) : showGiftCard ? (
              <div className="cart-gift-form font-inter">
                <input
                  type="text"
                  value={giftCode}
                  onChange={(e) => setGiftCode(e.target.value.toUpperCase())}
                  placeholder="TMC-XXXX-XXXX"
                  autoCapitalize="characters"
                />
                <button type="button" onClick={handleApplyGiftCard} disabled={giftLoading}>
                  {giftLoading ? '…' : 'Aplicar'}
                </button>
              </div>
            ) : (
              <button type="button" className="cart-gift-toggle font-inter" onClick={() => setShowGiftCard(true)}>
                🎁 ¿Tienes una Gift Card?
              </button>
            )}
            {giftError && <p className="cart-drawer-error font-inter">{giftError}</p>}

            <div className="cart-drawer-total font-inter">
              <span>Total</span>
              {discount > 0 ? (
                <span className="cart-drawer-total-amounts">
                  <s>{formatUSD(totalPrice)}</s>
                  <strong>{formatUSD(finalTotal)}</strong>
                </span>
              ) : (
                <strong>{formatUSD(totalPrice)}</strong>
              )}
            </div>
            {discount > 0 && (
              <p className="cart-gift-discount-line font-inter">
                Gift card: −{formatUSD(discount)}
                {applied && applied.balance - discount > 0
                  ? ` · te quedan ${formatUSD(applied.balance - discount)} de saldo`
                  : ''}
              </p>
            )}

            <label className="cart-drawer-email font-inter">
              Correo para recibir tu compra y la confirmación de tu cita
              <input
                type="email"
                value={effectiveEmail}
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
              {loading
                ? 'Procesando…'
                : finalTotal === 0 && discount > 0
                  ? 'Completar pedido (cubierto por la gift card)'
                  : 'Pagar con Mercado Pago'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
