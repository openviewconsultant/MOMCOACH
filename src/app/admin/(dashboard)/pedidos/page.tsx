import { createClient } from '@/lib/supabase/server';
import type { Order, OrderItem } from '@/lib/types';
import { formatUSD } from '@/lib/format';
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

  type BookingRow = {
    order_id: string | null;
    buyer_phone: string | null;
    start_time: string | null;
    status: string | null;
    notified_at: string | null;
  };

  // Las dos consultas dependientes van en paralelo, no en serie.
  const [{ data: itemsData }, { data: bookingsData }] =
    orderIds.length > 0
      ? await Promise.all([
          supabase.from('order_items').select('order_id, title').in('order_id', orderIds),
          supabase
            .from('bookings')
            .select('order_id, buyer_phone, start_time, status, notified_at')
            .in('order_id', orderIds)
            .order('start_time', { ascending: true }),
        ])
      : [
          { data: [] as Pick<OrderItem, 'order_id' | 'title'>[] },
          { data: [] as BookingRow[] },
        ];

  const titlesByOrder = new Map<string, string[]>();
  for (const item of (itemsData ?? []) as Pick<OrderItem, 'order_id' | 'title'>[]) {
    const list = titlesByOrder.get(item.order_id) ?? [];
    list.push(item.title);
    titlesByOrder.set(item.order_id, list);
  }

  const phoneByOrder = new Map<string, string>();
  const bookingByOrder = new Map<string, { startTime: string; status: string }>();
  const bookingNotifiedByOrder = new Set<string>();
  for (const b of (bookingsData ?? []) as BookingRow[]) {
    if (!b.order_id) continue;
    if (b.buyer_phone && !phoneByOrder.has(b.order_id)) phoneByOrder.set(b.order_id, b.buyer_phone);
    if (b.notified_at) bookingNotifiedByOrder.add(b.order_id);
    if (b.start_time && b.status !== 'cancelled' && !bookingByOrder.has(b.order_id)) {
      bookingByOrder.set(b.order_id, { startTime: b.start_time, status: b.status ?? 'pending' });
    }
  }

  const rows: OrderRow[] = orderList.map((order) => ({
    ...order,
    productTitles: (titlesByOrder.get(order.id) ?? []).join(', '),
    buyerPhone: phoneByOrder.get(order.id) ?? null,
    bookingStart: bookingByOrder.get(order.id)?.startTime ?? null,
    bookingStatus: bookingByOrder.get(order.id)?.status ?? null,
    emailSent: Boolean(order.notified_at) || bookingNotifiedByOrder.has(order.id),
  }));

  const approved = orderList.filter((o) => o.status === 'approved');
  const pending = orderList.filter((o) => o.status === 'pending');
  const rejected = orderList.filter((o) => o.status === 'rejected');
  const revenue = approved.reduce((sum, o) => sum + o.total, 0);

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-title font-fraunces">Pedidos</h1>
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
          <div className="admin-stat-value">{formatUSD(revenue)}</div>
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
