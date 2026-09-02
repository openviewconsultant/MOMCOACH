'use client';

import React, { useState } from 'react';
import type { Product } from '@/lib/types';
import '@/app/tienda/tienda.css';
import './gift-card-modal.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function GiftCardModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const [amount, setAmount] = useState('');
  const [purchaserEmail, setPurchaserEmail] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amountNum = Math.round(Number(amount));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!Number.isInteger(amountNum) || amountNum <= 0) {
      setError('Escribe el monto que quieres regalar (en dólares).');
      return;
    }
    if (!EMAIL_REGEX.test(purchaserEmail)) {
      setError('Ingresa tu correo electrónico.');
      return;
    }
    if (!EMAIL_REGEX.test(recipientEmail)) {
      setError('Ingresa el correo de quien recibe el regalo.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/gift-cards/comprar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          amount: amountNum,
          purchaserEmail: purchaserEmail.trim(),
          recipientEmail: recipientEmail.trim(),
          recipientName: recipientName.trim(),
          message: message.trim(),
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

  return (
    <div className="download-modal-overlay" onClick={onClose}>
      <div className="download-modal-card gift-card-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="download-modal-close" onClick={onClose} aria-label="Cerrar">
          ✕
        </button>
        <div className="download-modal-icon" aria-hidden="true">🎁</div>
        <h2 className="download-modal-title font-fraunces">{product.title}</h2>
        <p className="download-modal-desc font-inter">
          Elige el monto que quieres regalar. La persona lo recibe por correo con un código para canjear en la tienda.
        </p>

        <form className="download-modal-form gift-card-form" onSubmit={handleSubmit}>
          <label className="gift-card-field font-inter">
            <span>Monto a regalar (USD)</span>
            <div className="gift-card-amount">
              <span aria-hidden="true">$</span>
              <input
                type="number"
                min={1}
                step={1}
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="50"
                required
              />
            </div>
            <div className="gift-card-presets">
              {[25, 50, 100, 150].map((v) => (
                <button key={v} type="button" onClick={() => setAmount(String(v))}>
                  ${v}
                </button>
              ))}
            </div>
          </label>

          <label className="gift-card-field font-inter">
            <span>Tu correo electrónico</span>
            <input
              type="email"
              className="download-modal-input"
              value={purchaserEmail}
              onChange={(e) => setPurchaserEmail(e.target.value)}
              placeholder="tucorreo@ejemplo.com"
              required
            />
          </label>

          <label className="gift-card-field font-inter">
            <span>Nombre de quien recibe (opcional)</span>
            <input
              type="text"
              className="download-modal-input"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Nombre"
            />
          </label>

          <label className="gift-card-field font-inter">
            <span>Correo de quien recibe el regalo</span>
            <input
              type="email"
              className="download-modal-input"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="destinatario@ejemplo.com"
              required
            />
          </label>

          <label className="gift-card-field font-inter">
            <span>Mensaje (opcional)</span>
            <textarea
              className="download-modal-input"
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Un mensaje para acompañar el regalo…"
              maxLength={500}
            />
          </label>

          {error && <p className="cart-drawer-error font-inter">{error}</p>}

          <button type="submit" className="download-modal-btn-primary font-inter" disabled={loading}>
            {loading
              ? 'Redirigiendo a Mercado Pago…'
              : amountNum > 0
                ? `Regalar USD $${amountNum} con Mercado Pago`
                : 'Continuar al pago'}
          </button>
        </form>
      </div>
    </div>
  );
}
