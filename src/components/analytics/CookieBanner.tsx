'use client';

import React, { useState, useEffect } from 'react';

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('tmc_consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const getOrCreateVisitorId = () => {
    let vid = localStorage.getItem('tmc_visitor_id');
    if (!vid) {
      vid = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'v_' + Math.random().toString(36).substring(2);
      localStorage.setItem('tmc_visitor_id', vid);
    }
    return vid;
  };

  const handleConsent = (userEmail?: string) => {
    const vid = getOrCreateVisitorId();
    localStorage.setItem('tmc_consent', 'granted');

    if (userEmail) {
      localStorage.setItem('tmc_visitor_email', userEmail);
    }

    // Send analytics event
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitor_id: vid,
        visitor_email: userEmail || localStorage.getItem('tmc_visitor_email') || null,
        event_type: 'consent_given',
        page_url: window.location.pathname,
      }),
    }).catch(() => {});

    setSubmitted(true);
    setTimeout(() => {
      setShowBanner(false);
    }, 1200);
  };

  if (!showBanner) return null;

  return (
    <div className="cookie-banner-overlay">
      <div className="cookie-banner-card">
        {submitted ? (
          <div className="cookie-banner-thanks font-forum">
            <h3>¡Gracias por tu preferencia! 🎉</h3>
            <p>Tus preferencias han sido guardadas.</p>
          </div>
        ) : (
          <>
            <div className="cookie-banner-header">
              <span className="cookie-icon">🍪</span>
              <h3 className="font-forum">Tu privacidad y experiencia</h3>
            </div>
            <p className="cookie-banner-text font-inter">
              Usamos cookies para ofrecerte la mejor experiencia y personalizar nuestro contenido. Ingresa tu correo para avisarte cuando haya nuevas guías o regalos.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleConsent(email);
              }}
              className="cookie-banner-form"
            >
              <input
                type="email"
                placeholder="Tu correo electrónico (opcional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="cookie-banner-input font-inter"
              />
              <div className="cookie-banner-actions">
                <button
                  type="button"
                  onClick={() => handleConsent()}
                  className="cookie-btn-secondary font-inter"
                >
                  Solo necesarias
                </button>
                <button type="submit" className="cookie-btn-primary font-inter">
                  Aceptar y Continuar
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
