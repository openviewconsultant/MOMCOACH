'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Manejo de selección múltiple + borrado para las tablas del admin.
 * Devuelve estado de selección y una barra de acciones lista para renderizar.
 */
export function useBulkDelete(opts: {
  allIds: string[];
  deleteSelected: (ids: string[]) => Promise<void>;
  deleteAll: () => Promise<void>;
  labels: { one: string; many: string };
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  const allSelected = opts.allIds.length > 0 && opts.allIds.every((id) => selected.has(id));

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) opts.allIds.forEach((id) => next.delete(id));
      else opts.allIds.forEach((id) => next.add(id));
      return next;
    });
  }

  function runDeleteSelected() {
    const ids = [...selected];
    if (ids.length === 0) return;
    if (!window.confirm(`¿Eliminar ${ids.length} ${ids.length === 1 ? opts.labels.one : opts.labels.many}? No se puede deshacer.`)) return;
    startTransition(async () => {
      await opts.deleteSelected(ids);
      setSelected(new Set());
      router.refresh();
    });
  }

  function runDeleteAll() {
    if (!window.confirm(`¿Eliminar TODO el historial de ${opts.labels.many}? No se puede deshacer.`)) return;
    startTransition(async () => {
      await opts.deleteAll();
      setSelected(new Set());
      router.refresh();
    });
  }

  const bar =
    opts.allIds.length === 0 ? null : (
      <div className="admin-bulk-bar">
        {selected.size > 0 ? (
          <>
            <span>{selected.size} seleccionado(s)</span>
            <button type="button" className="admin-danger-btn" onClick={runDeleteSelected} disabled={pending}>
              {pending ? 'Eliminando…' : 'Eliminar seleccionados'}
            </button>
            <button type="button" className="admin-toolbar-pill" onClick={() => setSelected(new Set())}>
              Limpiar selección
            </button>
          </>
        ) : (
          <button type="button" className="admin-danger-btn ghost" onClick={runDeleteAll} disabled={pending}>
            {pending ? 'Eliminando…' : `Eliminar todo`}
          </button>
        )}
      </div>
    );

  return { selected, toggleOne, toggleAll, allSelected, bar, pending };
}
