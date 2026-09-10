'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { confirmOrderPaidAction } from '../actions';

export default function ConfirmPaymentButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  function run() {
    if (
      !window.confirm(
        '¿Confirmar que el pago de este pedido sí se recibió?\n\nSe marcará como aprobado, se agendará la cita en Google Calendar y se enviará el correo con toda la información a Denisse y a la clienta.'
      )
    ) {
      return;
    }
    startTransition(async () => {
      const res = await confirmOrderPaidAction(orderId);
      setMessage(res.message);
      setOk(res.ok);
      if (res.ok) router.refresh();
    });
  }

  return (
    <div style={{ marginTop: 6 }}>
      <button
        type="button"
        onClick={run}
        disabled={pending}
        className="font-inter"
        style={{
          background: 'var(--color-turquoise, #71B0B4)',
          color: '#fff',
          border: 'none',
          borderRadius: 20,
          padding: '5px 14px',
          fontSize: '0.78rem',
          fontWeight: 600,
          cursor: pending ? 'default' : 'pointer',
          opacity: pending ? 0.7 : 1,
        }}
      >
        {pending ? 'Confirmando…' : 'Confirmar pago y agendar'}
      </button>
      {message && (
        <span
          className="admin-table-subtext"
          style={{ display: 'block', marginTop: 4, color: ok ? '#2C7A4B' : 'var(--color-terracotta, #A6402F)' }}
        >
          {message}
        </span>
      )}
    </div>
  );
}
