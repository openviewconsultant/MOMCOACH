'use client';

import React, { useState } from 'react';

interface DownloadModalProps {
  productId: string;
  productTitle: string;
  onClose: () => void;
}

export default function DownloadModal({ productId, productTitle, onClose }: DownloadModalProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');

    try {
      const res = await fetch('/api/productos/enviar-descarga', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al enviar');

      // Save email in localStorage for analytics
      localStorage.setItem('tmc_visitor_email', email);

      // Track in analytics
      const vid = localStorage.getItem('tmc_visitor_id') || 'anon';
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitor_id: vid,
          visitor_email: email,
          event_type: 'product_download',
          page_url: window.location.pathname,
          product_id: productId,
          metadata: { title: productTitle },
        }),
      }).catch(() => {});

      setStatus('sent');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error inesperado');
      setStatus('error');
    }
  }

  return (
    <div className="download-modal-overlay" onClick={onClose}>
      <div className="download-modal-card" onClick={e => e.stopPropagation()}>
        {status === 'sent' ? (
          <div className="download-modal-success">
            <div className="download-modal-success-icon">🎉</div>
            <h3 className="font-forum">¡Listo! Revisa tu correo</h3>
            <p className="font-inter">
              Te enviamos el enlace de descarga a <strong>{email}</strong>.<br />
              Si no lo ves, revisa tu carpeta de spam.
            </p>
            <button className="download-modal-btn-primary font-inter" onClick={onClose}>
              Cerrar
            </button>
          </div>
        ) : (
          <>
            <button className="download-modal-close" onClick={onClose} aria-label="Cerrar">✕</button>
            <div className="download-modal-icon">📩</div>
            <h3 className="download-modal-title font-forum">Casi listo para descargar</h3>
            <p className="download-modal-desc font-inter">
              Ingresa tu correo y te enviamos el enlace de descarga de
              <br /><strong>{productTitle}</strong>
            </p>
            <form onSubmit={handleSubmit} className="download-modal-form">
              <input
                type="email"
                placeholder="tucorreo@ejemplo.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="download-modal-input font-inter"
                autoFocus
              />
              {status === 'error' && (
                <p className="download-modal-error font-inter">{errorMsg}</p>
              )}
              <button
                type="submit"
                className="download-modal-btn-primary font-inter"
                disabled={status === 'loading'}
              >
                {status === 'loading' ? 'Enviando…' : 'Enviarme el enlace 📩'}
              </button>
              <p className="download-modal-note font-inter">
                Solo te usaremos para enviarte el archivo y novedades relacionadas.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
