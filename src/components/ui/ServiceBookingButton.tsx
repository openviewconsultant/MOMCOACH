'use client';

import React, { useEffect, useState } from 'react';
import Cal, { getCalApi } from '@calcom/embed-react';
import Button from './Button';

const CAL_LINK = 'open-view-consultant-7ng550/30min';

interface ServiceBookingButtonProps {
  title: string;
  price: string;
  whatsappText: string;
  popular?: boolean;
  buttonText?: string;
}

export default function ServiceBookingButton({
  popular = false,
  buttonText = 'Solicitar Asesoría',
}: ServiceBookingButtonProps) {
  const [calOpen, setCalOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const cal = await getCalApi({ namespace: 'booking' });
      cal('ui', {
        hideEventTypeDetails: false,
        layout: 'month_view',
      });
    })();
  }, []);

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
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.55)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}
          onClick={() => setCalOpen(false)}
        >
          <div
            style={{
              background: 'white', borderRadius: '16px',
              width: '90vw', maxWidth: '900px',
              height: '82vh', overflow: 'hidden', position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setCalOpen(false)}
              style={{
                position: 'absolute', top: 12, right: 16, zIndex: 10,
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '1.4rem', color: '#888',
              }}
              aria-label="Cerrar"
            >✕</button>
            <Cal
              namespace="booking"
              calLink={CAL_LINK}
              style={{ width: '100%', height: '100%', overflow: 'scroll' }}
              config={{ layout: 'month_view' }}
            />
          </div>
        </div>
      )}
    </>
  );
}
