import { createClient } from '@/lib/supabase/server';
import type { Order, OrderItem } from '@/lib/types';
import { formatCOP } from '@/lib/format';
import PedidosTable, { type OrderRow } from './PedidosTable';

export default async function AdminPedidosPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  const orderList = (orders ?? []) as Order[];
  const orderIds = orderList.map((o) => o.id);

  const { data: itemsData } =
    orderIds.length > 0
      ? await supabase.from('order_items').select('order_id, title').in('order_id', orderIds)
      : { data: [] as Pick<OrderItem, 'order_id' | 'title'>[] };

  const titlesByOrder = new Map<string, string[]>();
  for (const item of (itemsData ?? []) as Pick<OrderItem, 'order_id' | 'title'>[]) {
    const list = titlesByOrder.get(item.order_id) ?? [];
    list.push(item.title);
    titlesByOrder.set(item.order_id, list);
  }

  const rows: OrderRow[] = orderList.map((order) => ({
    ...order,
    productTitles: (titlesByOrder.get(order.id) ?? []).join(', '),
  }));

  const approved = orderList.filter((o) => o.status === 'approved');
  const pending = orderList.filter((o) => o.status === 'pending');
  const rejected = orderList.filter((o) => o.status === 'rejected');
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
          <div className="admin-stat-value">{orderList.length}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Aprobados</div>
          <div className="admin-stat-value">{approved.length}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Pendientes</div>
          <div className="admin-stat-value">{pending.length}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Rechazados</div>
          <div className="admin-stat-value">{rejected.length}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Ingresos (aprobados)</div>
          <div className="admin-stat-value">{formatCOP(revenue)}</div>
        </div>
      </div>

      {orderList.length === 0 ? (
        <p className="admin-empty">Aún no hay pedidos.</p>
      ) : (
        <PedidosTable orders={rows} />
      )}
    </div>
  );
}
