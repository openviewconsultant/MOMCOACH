'use client';

import React, { useState } from 'react';
import { PopupModal, useCalendlyEventListener } from 'react-calendly';
import Button from './Button';

interface ServiceBookingButtonProps {
  title: string;
  price: string;
  whatsappText: string;
  popular?: boolean;
  buttonText?: string;
}

const CALENDLY_URL = 'https://calendly.com/edgarbarragangarcia/mom-coaching';

export default function ServiceBookingButton({
  title,
  price,
  whatsappText,
  popular = false,
  buttonText = 'Solicitar Asesoría',
}: ServiceBookingButtonProps) {
  const [calendlyOpen, setCalendlyOpen] = useState(false);
  const [scheduledDetails, setScheduledDetails] = useState<{ date?: string } | null>(null);

  useCalendlyEventListener({
    onEventScheduled: (e) => {
      // Event scheduled callback
      const eventUri = e.data.payload.event.uri;
      setScheduledDetails({ date: eventUri });
      setCalendlyOpen(false);

      // Once date is chosen, proceed to reservation payment via WhatsApp or checkout
      const message = `${whatsappText} (Fecha seleccionada en calendario: ${eventUri})`;
      window.open(`https://wa.me/573102158656?text=${encodeURIComponent(message)}`, '_blank');
    },
  });

  return (
    <>
      <Button
        variant={popular ? 'primary' : 'secondary'}
        style={{ width: '100%' }}
        onClick={() => setCalendlyOpen(true)}
      >
        {buttonText}
      </Button>

      {typeof document !== 'undefined' && (
        <PopupModal
          url={CALENDLY_URL}
          rootElement={document.body}
          open={calendlyOpen}
          onModalClose={() => setCalendlyOpen(false)}
        />
      )}
    </>
  );
}
