'use client';

import { useActionState } from 'react';
import { sendTestGiftCardEmailAction } from '../../actions';

export default function TestEmailForm() {
  const [state, action, pending] = useActionState(sendTestGiftCardEmailAction, { ok: false, message: '' });

  return (
    <form action={action} className="admin-bulk-bar" style={{ marginTop: 4, flexWrap: 'wrap' }}>
      <span style={{ fontWeight: 600 }}>Crear gift card de prueba:</span>
      <select
        name="program"
        defaultValue="sueno"
        style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.15)', fontSize: '0.85rem' }}
      >
        <option value="sueno">Programa de Sueño</option>
        <option value="alimentacion">Programa de Alimentación</option>
      </select>
      <input
        type="number"
        name="amount"
        min={1}
        defaultValue={20}
        style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.15)', fontSize: '0.85rem', width: 80 }}
        aria-label="Monto USD"
      />
      <input
        type="email"
        name="email"
        required
        placeholder="correo de destino"
        style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.15)', fontSize: '0.85rem', minWidth: 200 }}
      />
      <button type="submit" className="admin-toolbar-pill" disabled={pending}>
        {pending ? 'Enviando…' : 'Crear y enviar'}
      </button>
      {state.message && (
        <span style={{ fontSize: '0.82rem', color: state.ok ? '#2e7d32' : '#c0392b' }}>{state.message}</span>
      )}
    </form>
  );
}
