'use client';

import React, { useEffect, useState } from 'react';
import Cal, { getCalApi } from '@calcom/embed-react';
import Button from './Button';

interface ServiceBookingButtonProps {
  title: string;
  price: string;
  whatsappText: string;
  popular?: boolean;
  buttonText?: string;
  calLink?: string;
}

export default function ServiceBookingButton({
  popular = false,
  buttonText = 'Solicitar Asesoría',
  calLink = 'open-view-consultant-7ng550/30min',
}: ServiceBookingButtonProps) {
  const [calOpen, setCalOpen] = useState(false);
  const namespace = calLink.split('/')[1] || 'booking';

  useEffect(() => {
    (async () => {
      const cal = await getCalApi({ namespace });
      cal('ui', {
        hideEventTypeDetails: false,
        layout: 'month_view',
      });
    })();
  }, [namespace]);

  return (
    <>
      <Button
        variant={popular ? 'primary' : 'secondary'}
        style={{ width: '100%' }}
        onClick={() => setCalOpen(true)}
      >
        {buttonText}
      </Button>

      {calOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setCalOpen(false)}
        >
          <div
            style={{
              background: '#181818',
              borderRadius: '16px',
              width: '90vw',
              maxWidth: '900px',
              height: '82vh',
              overflow: 'hidden',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setCalOpen(false)}
              style={{
                position: 'absolute',
                top: 12,
                right: 16,
                zIndex: 10,
                background: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '1.2rem',
                color: '#ffffff',
              }}
              aria-label="Cerrar"
            >
              ✕
            </button>
            <Cal
              namespace={namespace}
              calLink={calLink}
              style={{ width: '100%', height: '100%', overflow: 'scroll' }}
              config={{ layout: 'month_view', useSlotsViewOnSmallScreen: 'true' }}
            />
          </div>
        </div>
      )}
    </>
  );
}
