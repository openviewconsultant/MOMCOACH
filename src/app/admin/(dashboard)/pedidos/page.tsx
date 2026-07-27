import { createClient } from '@/lib/supabase/server';
import type { Order } from '@/lib/types';
import { formatCOP } from '@/lib/format';

export default async function AdminPedidosPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  const items = (orders ?? []) as Order[];
  const approved = items.filter((o) => o.status === 'approved');
  const revenue = approved.reduce((sum, o) => sum + o.total, 0);

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-title font-forum">Pedidos</h1>
          <p className="admin-subtitle">Historial de compras procesadas por Mercado Pago.</p>
        </div>
      </div>

      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-label">Pedidos totales</div>
          <div className="admin-stat-value">{items.length}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Aprobados</div>
          <div className="admin-stat-value">{approved.length}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Ingresos (aprobados)</div>
          <div className="admin-stat-value">{formatCOP(revenue)}</div>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="admin-empty">Aún no hay pedidos.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Comprador</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Correo enviado</th>
              </tr>
            </thead>
            <tbody>
              {items.map((order) => (
                <tr key={order.id}>
                  <td>{new Date(order.created_at).toLocaleString('es-CO')}</td>
                  <td>{order.buyer_email}</td>
                  <td>{formatCOP(order.total)}</td>
                  <td>
                    <span
                      className={`admin-badge ${order.status === 'approved' ? 'published' : 'draft'}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td>{order.notified_at ? 'Sí' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
