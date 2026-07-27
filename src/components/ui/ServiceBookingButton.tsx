'use client';

import React, { useEffect } from 'react';
import { getCalApi } from '@calcom/embed-react';
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
  const namespace = calLink.split('/')[1] || 'booking';

  useEffect(() => {
    (async () => {
      const cal = await getCalApi({ namespace });
      cal('ui', {
        theme: 'dark',
        hideEventTypeDetails: false,
        layout: 'month_view',
      });
    })();
  }, [namespace]);

  async function handleOpenModal() {
    const cal = await getCalApi({ namespace });
    cal('modal', {
      calLink,
      config: { layout: 'month_view' },
    });
  }

  return (
    <Button
      variant={popular ? 'primary' : 'secondary'}
      style={{ width: '100%' }}
      onClick={handleOpenModal}
    >
      {buttonText}
    </Button>
  );
}
