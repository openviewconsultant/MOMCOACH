'use client';

import { useMemo, useState } from 'react';
import type { Order } from '@/lib/types';
import { formatCOP, formatDateTimeCO } from '@/lib/format';
import { friendlyStatusDetail } from './status-detail';

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
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Order['status']>('all');

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

      {filtered.length === 0 ? (
        <p className="admin-empty">No hay pedidos que coincidan con el filtro.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
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
                  <tr key={order.id}>
                    <td>{formatDateTimeCO(order.created_at)}</td>
                    <td>{order.buyer_email}</td>
                    <td className="admin-cell-wrap">{order.productTitles || '—'}</td>
                    <td>{formatCOP(order.total)}</td>
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
