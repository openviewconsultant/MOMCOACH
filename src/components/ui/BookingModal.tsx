'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useCart } from '@/lib/cart-context';
import { CalendarDayPicker, TimeHourGrid, useAvailability, type Slot } from './TimeSlotPicker';
import './booking-modal.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TIME_ZONE = 'America/Bogota';

const DEFAULT_CALENDAR_ID = 'default';

interface BookingModalProps {
  productId: string;
  productTitle: string;
  price: number;
  priceLabel: string;
  calendarId?: string | null;
  onClose: () => void;
}

function StepIndicator({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className="booking-step-indicator">
      <span className={`booking-step-dot${step === 1 ? ' active' : ''}`}>
        <span className="num">1</span> Tus datos
      </span>
      <span className="booking-step-line" />
      <span className={`booking-step-dot${step === 2 ? ' active' : ''}`}>
        <span className="num">2</span> Día
      </span>
      <span className="booking-step-line" />
      <span className={`booking-step-dot${step === 3 ? ' active' : ''}`}>
        <span className="num">3</span> Hora
      </span>
    </div>
  );
}

export default function BookingModal({ productId, productTitle, price, priceLabel, calendarId, onClose }: BookingModalProps) {
  const resolvedCalendarId = calendarId || DEFAULT_CALENDAR_ID;
  const { addBooking, setCheckoutEmail } = useCart();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dayIso, setDayIso] = useState<string | null>(null);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { slots: availSlots, error: availError, daysByKey } = useAvailability(TIME_ZONE, resolvedCalendarId);

  function handleContinue(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('Ingresa tu nombre.');
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      setError('Ingresa un correo electrónico válido.');
      return;
    }
    setStep(2);
  }

  function handleSelectDay(iso: string) {
    setDayIso(iso);
    setSlot(null);
    setStep(3);
  }

  function handleConfirm() {
    setError(null);
    if (!slot) {
      setError('Elige un horario para tu cita.');
      return;
    }
    const raw = new Intl.DateTimeFormat('es-CO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: TIME_ZONE,
    }).format(new Date(slot.start));
    const label = raw.charAt(0).toUpperCase() + raw.slice(1);
    setCheckoutEmail(email);
    addBooking(
      { id: productId, title: productTitle, price },
      { start: slot.start, end: slot.end, label, buyerName: name.trim(), calendarId: resolvedCalendarId }
    );
    onClose();
  }

  const daySlots = dayIso ? daysByKey.get(dayIso)?.slots ?? [] : [];

  return createPortal(
    <div className="booking-modal-overlay" onClick={onClose}>
      <div className="booking-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="booking-modal-close" onClick={onClose} aria-label="Cerrar">✕</button>
        <img src="/logo-white-bg.png" alt="The Mom Coach" className="booking-modal-logo" />
        <h3 className="booking-modal-title font-fraunces">{productTitle}</h3>
        <p className="booking-modal-desc font-inter">
          Precio: <strong>{priceLabel}</strong>. Elige tus datos y el horario; al confirmar, la asesoría se añade a tu carrito con la fecha reservada. El pago se hace desde el carrito y tu cita queda agendada cuando el pago sea aprobado.
        </p>

        <StepIndicator step={step} />

        {step === 1 && (
          <form onSubmit={handleContinue} className="booking-modal-form">
            <input
              type="text"
              placeholder="Nombre completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              className="booking-modal-input font-inter"
            />
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="booking-modal-input font-inter"
            />
            {error && <p className="booking-modal-error font-inter">{error}</p>}
            <button type="submit" className="booking-modal-btn-primary font-inter">
              Continuar
            </button>
          </form>
        )}

        {step === 2 && (
          <div className="booking-modal-form">
            <p className="booking-slot-label font-inter">Elige un día</p>
            <CalendarDayPicker
              timeZone={TIME_ZONE}
              daysByKey={daysByKey}
              loading={availSlots === null}
              error={availError}
              onSelectDay={handleSelectDay}
            />
            <button type="button" className="booking-modal-btn-secondary font-inter" onClick={() => setStep(1)}>
              ← Volver
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="booking-modal-form">
            <p className="booking-slot-label font-inter">Elige una hora</p>
            <TimeHourGrid daySlots={daySlots} selected={slot} onSelect={setSlot} timeZone={TIME_ZONE} />
            {error && <p className="booking-modal-error font-inter">{error}</p>}
            <button
              type="button"
              className="booking-modal-btn-primary font-inter"
              onClick={handleConfirm}
              disabled={!slot}
            >
              Añadir al carrito
            </button>
            <button type="button" className="booking-modal-btn-secondary font-inter" onClick={() => setStep(2)}>
              ← Elegir otro día
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
