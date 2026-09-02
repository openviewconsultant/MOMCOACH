import { createClient } from '@/lib/supabase/server';
import DescargasTable, { type DownloadRow } from './DescargasTable';

interface DownloadEvent {
  id: string;
  visitor_email: string | null;
  product_id: string | null;
  created_at: string;
  metadata: Record<string, unknown> | null;
}

export default async function AdminDescargasPage() {
  const supabase = await createClient();

  const { data: eventsData } = await supabase
    .from('analytics_events')
    .select('id, visitor_email, product_id, created_at, metadata')
    .eq('event_type', 'product_download')
    .order('created_at', { ascending: false })
    .limit(500);
  const events = (eventsData ?? []) as DownloadEvent[];

  const productIds = [...new Set(events.map((e) => e.product_id).filter((x): x is string => Boolean(x)))];
  const { data: prodData } =
    productIds.length > 0
      ? await supabase.from('products').select('id, title').in('id', productIds)
      : { data: [] as { id: string; title: string }[] };
  const titleById = new Map((prodData ?? []).map((p) => [p.id, p.title]));

  const uniqueEmails = new Set(events.map((e) => e.visitor_email).filter(Boolean));

  const rows: DownloadRow[] = events.map((ev) => {
    const geo = (ev.metadata?.geo ?? {}) as { city?: string | null; country?: string | null };
    return {
      id: ev.id,
      email: ev.visitor_email,
      resource: ev.product_id ? titleById.get(ev.product_id) ?? ev.product_id : '—',
      created_at: ev.created_at,
      location: [geo.city, geo.country].filter(Boolean).join(', '),
    };
  });

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-title font-fraunces">Descargas gratuitas</h1>
          <p className="admin-subtitle">
            Personas que descargaron un recurso gratuito (correo, recurso y fecha).
          </p>
        </div>
      </div>

      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-label">Descargas</div>
          <div className="admin-stat-value">{events.length}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Correos únicos</div>
          <div className="admin-stat-value">{uniqueEmails.size}</div>
        </div>
      </div>

      {events.length === 0 ? (
        <p className="admin-empty">Aún no hay descargas registradas.</p>
      ) : (
        <DescargasTable rows={rows} />
      )}
    </div>
  );
}
