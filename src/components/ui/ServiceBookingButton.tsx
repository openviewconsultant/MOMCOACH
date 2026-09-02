'use client';

import React, { useState } from 'react';
import Button from './Button';
import BookingModal from './BookingModal';
import FreeCallModal from './FreeCallModal';
import { prefetchAvailability } from '@/lib/booking-availability-cache';
import { formatUSD } from '@/lib/format';

const DEFAULT_CALENDAR_ID = 'default';

interface ServiceBookingButtonProps {
  productId?: string;
  title: string;
  price?: number;
  calendarId?: string | null;
  popular?: boolean;
  buttonText?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export default function ServiceBookingButton({
  productId,
  title,
  price = 0,
  calendarId,
  popular = false,
  buttonText = 'Solicitar Asesoría',
  className,
  variant,
}: ServiceBookingButtonProps) {
  const [open, setOpen] = useState(false);
  const isPaid = price > 0 && Boolean(productId);
  const resolvedCalendarId = calendarId || DEFAULT_CALENDAR_ID;

  const handlePrefetch = () => prefetchAvailability(resolvedCalendarId);
  const handleOpen = () => {
    handlePrefetch();
    setOpen(true);
  };

  const button = className ? (
    <button type="button" className={className} onClick={handleOpen} onMouseEnter={handlePrefetch}>
      {buttonText}
    </button>
  ) : (
    <Button
      variant={variant || (popular ? 'primary' : 'secondary')}
      style={{ width: '100%' }}
      onClick={handleOpen}
      onMouseEnter={handlePrefetch}
    >
      {buttonText}
    </Button>
  );

  return (
    <>
      {button}
      {open && isPaid && productId && (
        <BookingModal
          productId={productId}
          productTitle={title}
          priceLabel={formatUSD(price)}
          calendarId={resolvedCalendarId}
          onClose={() => setOpen(false)}
        />
      )}
      {open && !isPaid && (
        <FreeCallModal
          title={title}
          subtitle="Elige el horario que mejor te quede y te confirmamos por correo."
          calendarId={resolvedCalendarId}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
