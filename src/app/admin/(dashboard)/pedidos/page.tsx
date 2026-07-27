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

  return (
    <div>
      <h1 className="admin-title font-forum">Pedidos</h1>

      {items.length === 0 ? (
        <p className="admin-empty">Aún no hay pedidos.</p>
      ) : (
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
      )}
    </div>
  );
}
