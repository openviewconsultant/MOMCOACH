'use client';

import React, { useLayoutEffect, useRef, useState } from 'react';
import './pdf-preview-modal.css';

interface PdfPreviewModalProps {
  productId: string;
  productTitle: string;
  originRect: DOMRect | null;
  onClose: () => void;
  onDownload: () => void;
}

export default function PdfPreviewModal({ productId, productTitle, originRect, onClose, onDownload }: PdfPreviewModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [closing, setClosing] = useState(false);

  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!card || !originRect) {
      setEntered(true);
      return;
    }

    const targetRect = card.getBoundingClientRect();
    const originCenterX = originRect.left + originRect.width / 2;
    const originCenterY = originRect.top + originRect.height / 2;
    const targetCenterX = targetRect.left + targetRect.width / 2;
    const targetCenterY = targetRect.top + targetRect.height / 2;
    const dx = originCenterX - targetCenterX;
    const dy = originCenterY - targetCenterY;
    const scale = Math.max(0.15, Math.min(0.5, originRect.width / targetRect.width));

    card.style.transition = 'none';
    card.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;
    card.style.opacity = '0.4';

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!cardRef.current) return;
        cardRef.current.style.transition = 'transform 0.45s cubic-bezier(.2,.8,.2,1), opacity 0.3s ease';
        cardRef.current.style.transform = 'translate(0, 0) scale(1)';
        cardRef.current.style.opacity = '1';
        setEntered(true);
      });
    });
  }, [originRect]);

  function handleClose() {
    setClosing(true);
    window.setTimeout(onClose, 200);
  }

  return (
    <div
      className={`pdf-preview-overlay ${entered ? 'in' : ''} ${closing ? 'out' : ''}`}
      onClick={handleClose}
    >
      <div className="pdf-preview-card" ref={cardRef} onClick={(e) => e.stopPropagation()}>
        <button className="pdf-preview-close" onClick={handleClose} aria-label="Cerrar">✕</button>
        <div className="pdf-preview-header">
          <h3 className="font-forum">{productTitle}</h3>
          <span className="pdf-preview-badge font-inter">Gratis</span>
        </div>
        <div className="pdf-preview-viewport">
          {!iframeLoaded && (
            <div className="pdf-preview-loading">
              <span className="pdf-preview-spinner" />
              <p className="font-inter">Cargando vista previa…</p>
            </div>
          )}
          <iframe
            src={`/api/productos/${productId}/descargar`}
            title={productTitle}
            onLoad={() => setIframeLoaded(true)}
            className={iframeLoaded ? 'visible' : ''}
          />
        </div>
        <div className="pdf-preview-footer">
          <button type="button" className="pdf-preview-btn font-inter" onClick={onDownload}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M12 4v11m0 0 4-4m-4 4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5 18h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Descargar gratis
          </button>
        </div>
      </div>
    </div>
  );
}
