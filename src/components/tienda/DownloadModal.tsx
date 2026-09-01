'use client';

import React, { useState } from 'react';

interface DownloadModalProps {
  productId: string;
  productTitle: string;
  onClose: () => void;
}

export default function DownloadModal({ productId, productTitle, onClose }: DownloadModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email) return;
    setStatus('loading');

    // Save in localStorage for analytics tracking
    localStorage.setItem('tmc_visitor_name', name);
    localStorage.setItem('tmc_visitor_email', email);

    // Track analytics event
    const vid = localStorage.getItem('tmc_visitor_id') || 'anon';
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitor_id: vid,
          visitor_email: email,
          event_type: 'product_download',
          page_url: window.location.pathname,
          product_id: productId,
          metadata: { name, title: productTitle },
        }),
      });
    } catch {
      // Proceed even if tracking fetch fails
    }

    setStatus('done');

    // Automatically trigger the download redirect
    window.location.href = `/api/productos/${productId}/descargar`;
  }

  return (
    <div className="download-modal-overlay" onClick={onClose}>
      <div className="download-modal-card" onClick={e => e.stopPropagation()}>
        {status === 'done' ? (
          <div className="download-modal-success">
            <div className="download-modal-success-icon">🎉</div>
            <h3 className="font-fraunces">¡Iniciando tu descarga!</h3>
            <p className="font-inter">
              Gracias <strong>{name}</strong>. Tu archivo comenzará a descargarse en unos segundos.
            </p>
            <button className="download-modal-btn-primary font-inter" onClick={onClose} style={{ marginTop: '16px' }}>
              Cerrar
            </button>
          </div>
        ) : (
          <>
            <button className="download-modal-close" onClick={onClose} aria-label="Cerrar">✕</button>
            <div className="download-modal-icon">🎁</div>
            <h3 className="download-modal-title font-fraunces">Descarga gratuita</h3>
            <p className="download-modal-desc font-inter">
              Ingresa tus datos para descargar gratis
              <br /><strong>{productTitle}</strong>
            </p>
            <form onSubmit={handleSubmit} className="download-modal-form">
              <input
                type="text"
                placeholder="Nombre completo"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="download-modal-input font-inter"
                autoFocus
              />
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="download-modal-input font-inter"
              />
              <button
                type="submit"
                className="download-modal-btn-primary font-inter"
                disabled={status === 'loading'}
              >
                {status === 'loading' ? 'Procesando…' : 'Descargar ahora 📥'}
              </button>
              <p className="download-modal-note font-inter">
                Tus datos están seguros y los usaremos para personalizar tu experiencia.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
