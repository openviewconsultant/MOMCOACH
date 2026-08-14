'use client';

import { useMemo, useState, useTransition } from 'react';
import type { Booking } from '@/lib/types';
import { formatDateTimeCO } from '@/lib/format';
import { deleteBookingsAction, deleteAllBookingsAction } from '../../actions';

export interface CitaRow extends Booking {
  calendarName: string;
}

const STATUS_LABEL: Record<Booking['status'], string> = {
  confirmed: 'Confirmada',
  pending: 'Pendiente de pago',
  cancelled: 'Cancelada',
};

const BADGE_CLASS: Record<Booking['status'], string> = {
  confirmed: 'published',
  pending: 'pending',
  cancelled: 'rejected',
};

function formatCitaDate(iso: string) {
  return formatDateTimeCO(iso, { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Bogota' });
}

export default function CitasTable({ citas, calendarNames }: { citas: CitaRow[]; calendarNames: string[] }) {
  const [search, setSearch] = useState('');
  const [calendarFilter, setCalendarFilter] = useState('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return citas.filter((cita) => {
      if (calendarFilter !== 'all' && cita.calendarName !== calendarFilter) return false;
      if (!term) return true;
      return (
        cita.buyer_name.toLowerCase().includes(term) ||
        cita.buyer_email.toLowerCase().includes(term)
      );
    });
  }, [citas, search, calendarFilter]);

  const allVisibleSelected = filtered.length > 0 && filtered.every((c) => selected.has(c.id));

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllVisible() {
    setSelected((prev) => {
      if (allVisibleSelected) {
        const next = new Set(prev);
        filtered.forEach((c) => next.delete(c.id));
        return next;
      }
      const next = new Set(prev);
      filtered.forEach((c) => next.add(c.id));
      return next;
    });
  }

  function handleDeleteSelected() {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    if (!window.confirm(`¿Eliminar ${ids.length} cita(s) seleccionada(s)? Esta acción no se puede deshacer.`)) return;
    startTransition(async () => {
      await deleteBookingsAction(ids);
      setSelected(new Set());
    });
  }

  function handleDeleteAll() {
    if (citas.length === 0) return;
    if (!window.confirm(`¿Eliminar TODAS las ${citas.length} citas? Esta acción no se puede deshacer.`)) return;
    startTransition(async () => {
      await deleteAllBookingsAction();
      setSelected(new Set());
    });
  }

  return (
    <div className="admin-settings-card" style={{ maxWidth: 'none' }}>
      <div className="admin-settings-card-header">
        <span className="admin-settings-card-icon">🗒️</span>
        <h2 className="admin-settings-card-title font-forum">Citas agendadas</h2>
        {citas.length > 0 && (
          <button
            type="button"
            onClick={handleDeleteAll}
            disabled={isPending}
            className="font-inter"
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--color-terracotta)', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            Borrar todas
          </button>
        )}
      </div>

      <div className="admin-toolbar">
        <input
          type="text"
          className="admin-toolbar-search"
          placeholder="Buscar por nombre o correo…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          type="button"
          className={`admin-toolbar-pill${calendarFilter === 'all' ? ' active' : ''}`}
          onClick={() => setCalendarFilter('all')}
        >
          Todos
        </button>
        {calendarNames.map((name) => (
          <button
            key={name}
            type="button"
            className={`admin-toolbar-pill${calendarFilter === name ? ' active' : ''}`}
            onClick={() => setCalendarFilter(name)}
          >
            {name}
          </button>
        ))}
      </div>

      {selected.size > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <span className="font-inter" style={{ fontSize: '0.85rem', color: 'var(--foreground)', opacity: 0.75 }}>
            {selected.size} seleccionada(s)
          </span>
          <button
            type="button"
            onClick={handleDeleteSelected}
            disabled={isPending}
            className="font-inter"
            style={{
              background: 'var(--color-terracotta)',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              padding: '6px 16px',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: isPending ? 'default' : 'pointer',
              opacity: isPending ? 0.7 : 1,
            }}
          >
            {isPending ? 'Eliminando…' : 'Borrar seleccionadas'}
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="admin-empty">No hay citas que coincidan con el filtro.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '32px' }}>
                  <input type="checkbox" checked={allVisibleSelected} onChange={toggleAllVisible} aria-label="Seleccionar todas las citas visibles" />
                </th>
                <th>Fecha de la cita</th>
                <th>Calendario</th>
                <th>Cliente</th>
                <th>Estado</th>
                <th>Videollamada</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((cita) => (
                <tr key={cita.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.has(cita.id)}
                      onChange={() => toggleOne(cita.id)}
                      aria-label={`Seleccionar cita de ${cita.buyer_name}`}
                    />
                  </td>
                  <td>{formatCitaDate(cita.start_time)}</td>
                  <td>{cita.calendarName}</td>
                  <td className="admin-cell-wrap">
                    {cita.buyer_name}
                    <span className="admin-table-subtext">{cita.buyer_email}</span>
                  </td>
                  <td>
                    <span className={`admin-badge ${BADGE_CLASS[cita.status]}`}>{STATUS_LABEL[cita.status]}</span>
                  </td>
                  <td>
                    {cita.meet_link ? (
                      <a href={cita.meet_link} target="_blank" rel="noopener noreferrer">Enlace</a>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
