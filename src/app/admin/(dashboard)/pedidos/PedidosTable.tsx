'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Order } from '@/lib/types';
import { formatUSD, formatDateTimeCO } from '@/lib/format';
import { friendlyStatusDetail } from './status-detail';
import { deleteOrdersAction, deleteAllOrdersAction } from '../../actions';

export interface OrderRow extends Order {
  productTitles: string;
}

const STATUS_FILTERS: { value: 'all' | Order['status']; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'approved', label: 'Aprobados' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'rejected', label: 'Rechazados' },
];

const BADGE_CLASS: Record<Order['status'], string> = {
  approved: 'published',
  pending: 'pending',
  rejected: 'rejected',
};

const STATUS_LABEL: Record<Order['status'], string> = {
  approved: 'Aprobado',
  pending: 'Pendiente',
  rejected: 'Rechazado',
};

export default function PedidosTable({ orders }: { orders: OrderRow[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Order['status']>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return orders.filter((order) => {
      if (statusFilter !== 'all' && order.status !== statusFilter) return false;
      if (!term) return true;
      return (
        order.buyer_email.toLowerCase().includes(term) ||
        order.productTitles.toLowerCase().includes(term) ||
        order.id.toLowerCase().includes(term)
      );
    });
  }, [orders, search, statusFilter]);

  const allFilteredSelected = filtered.length > 0 && filtered.every((o) => selected.has(o.id));

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllFiltered() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) filtered.forEach((o) => next.delete(o.id));
      else filtered.forEach((o) => next.add(o.id));
      return next;
    });
  }

  function runDeleteSelected() {
    const ids = [...selected];
    if (ids.length === 0) return;
    if (!window.confirm(`¿Eliminar ${ids.length} pedido(s)? Esta acción no se puede deshacer.`)) return;
    startTransition(async () => {
      await deleteOrdersAction(ids);
      setSelected(new Set());
      router.refresh();
    });
  }

  function runDeleteAll() {
    if (!window.confirm('¿Eliminar TODO el historial de pedidos? Esta acción no se puede deshacer.')) return;
    startTransition(async () => {
      await deleteAllOrdersAction();
      setSelected(new Set());
      router.refresh();
    });
  }

  return (
    <>
      <div className="admin-toolbar">
        <input
          type="text"
          className="admin-toolbar-search"
          placeholder="Buscar por correo, producto o ID de orden…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            className={`admin-toolbar-pill${statusFilter === filter.value ? ' active' : ''}`}
            onClick={() => setStatusFilter(filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {(selected.size > 0 || orders.length > 0) && (
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
              {pending ? 'Eliminando…' : 'Eliminar todo el historial'}
            </button>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="admin-empty">No hay pedidos que coincidan con el filtro.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 36 }}>
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={toggleAllFiltered}
                    aria-label="Seleccionar todos"
                  />
                </th>
                <th>ID</th>
                <th>Fecha</th>
                <th>Comprador</th>
                <th>Producto(s)</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Correo enviado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => {
                const detail = friendlyStatusDetail(order.status_detail);
                return (
                  <tr key={order.id} className={selected.has(order.id) ? 'is-selected' : undefined}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.has(order.id)}
                        onChange={() => toggleOne(order.id)}
                        aria-label={`Seleccionar pedido ${order.id}`}
                      />
                    </td>
                    <td>
                      <code
                        title={order.id}
                        style={{ fontSize: '0.72rem', color: 'var(--foreground)', opacity: 0.6, cursor: 'help' }}
                      >
                        {order.id.slice(0, 8)}
                      </code>
                    </td>
                    <td>{formatDateTimeCO(order.created_at)}</td>
                    <td>{order.buyer_email}</td>
                    <td className="admin-cell-wrap">{order.productTitles || '—'}</td>
                    <td>{formatUSD(order.total)}</td>
                    <td className="admin-cell-wrap">
                      <span className={`admin-badge ${BADGE_CLASS[order.status]}`}>
                        {STATUS_LABEL[order.status]}
                      </span>
                      {order.status !== 'approved' && detail && (
                        <span className="admin-table-subtext">{detail}</span>
                      )}
                    </td>
                    <td>{order.notified_at ? 'Sí' : 'No'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
