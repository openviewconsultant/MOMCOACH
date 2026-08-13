'use client';

import { useState, type ReactNode } from 'react';

export default function CalendarioTabs({ calendarios, citas }: { calendarios: ReactNode; citas: ReactNode }) {
  const [tab, setTab] = useState<'calendarios' | 'citas'>('calendarios');

  return (
    <div>
      <div className="admin-toolbar" style={{ marginBottom: '20px' }}>
        <button
          type="button"
          className={`admin-toolbar-pill${tab === 'calendarios' ? ' active' : ''}`}
          onClick={() => setTab('calendarios')}
        >
          📅 Calendarios
        </button>
        <button
          type="button"
          className={`admin-toolbar-pill${tab === 'citas' ? ' active' : ''}`}
          onClick={() => setTab('citas')}
        >
          🗒️ Agenda
        </button>
      </div>

      <div style={{ display: tab === 'calendarios' ? 'block' : 'none' }}>{calendarios}</div>
      <div style={{ display: tab === 'citas' ? 'block' : 'none' }}>{citas}</div>
    </div>
  );
}
