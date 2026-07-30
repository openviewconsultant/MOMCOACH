'use client';

import React, { useEffect, useRef, useState } from 'react';

const SHARP_PAGES = 2;

interface PdfPagesRendererProps {
  fileUrl: string;
  onReady: () => void;
}

export default function PdfPagesRenderer({ fileUrl, onReady }: PdfPagesRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

        const loadingTask = pdfjsLib.getDocument({ url: fileUrl });
        const pdf = await loadingTask.promise;
        if (cancelled) return;

        const container = containerRef.current;
        if (!container) return;

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          if (cancelled) return;
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.4 });

          const canvas = document.createElement('canvas');
          canvas.className = 'pdf-page-canvas' + (pageNum > SHARP_PAGES ? ' blurred' : '');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) continue;

          await page.render({ canvas, canvasContext: ctx, viewport }).promise;
          if (cancelled) return;

          container.appendChild(canvas);

          if (pageNum === SHARP_PAGES) {
            onReady();
          }
          if (pageNum === SHARP_PAGES && pdf.numPages > SHARP_PAGES) {
            const lockOverlay = document.createElement('div');
            lockOverlay.className = 'pdf-page-lock';
            lockOverlay.innerHTML = '<span>🔒 Descarga el documento completo para ver el resto</span>';
            container.appendChild(lockOverlay);
          }
        }

        if (pdf.numPages <= SHARP_PAGES) {
          onReady();
        }
      } catch (err) {
        console.error('Error renderizando vista previa PDF', err);
        if (!cancelled) {
          setError(true);
          onReady();
        }
      }
    }

    render();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileUrl]);

  if (error) {
    return <p className="pdf-preview-error font-inter">No se pudo cargar la vista previa.</p>;
  }

  return <div className="pdf-pages-container" ref={containerRef} />;
}
