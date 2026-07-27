'use client';

import React, { useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

interface GeoData {
  city?: string | null;
  region?: string | null;
  country?: string | null;
  lat?: number | null;
  lon?: number | null;
}

interface AnalyticsEvent {
  id: string;
  visitor_id: string;
  visitor_email: string | null;
  event_type: string;
  page_url: string;
  product_id: string | null;
  metadata: { label?: string; href?: string; tag?: string; geo?: GeoData } & Record<string, unknown>;
  created_at: string;
}

/** Country code → emoji flag */
function countryFlag(code: string | null | undefined): string {
  if (!code || code.length !== 2) return '🌍';
  return String.fromCodePoint(
    ...code.toUpperCase().split('').map(c => 0x1F1E6 - 65 + c.charCodeAt(0))
  );
}

interface Product {
  id: string;
  title: string;
  category: string;
}

const COLORS = ['#71B0B4', '#CD807B', '#4C577C', '#C4C371', '#EFC6A1', '#BF604B', '#938E5C', '#C8890E'];

const EVENT_LABELS: Record<string, string> = {
  page_view: 'Vista de página',
  product_view: 'Vista de producto',
  product_download: 'Descarga',
  purchase: 'Compra',
  consent_given: 'Consentimiento',
  click: 'Clic',
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

export default function AnalyticsDashboard({
  events,
  products,
}: {
  events: AnalyticsEvent[];
  products: Product[];
}) {
  const productMap = useMemo(() => {
    const m: Record<string, string> = {};
    products.forEach((p) => { m[p.id] = p.title; });
    return m;
  }, [products]);

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const totalViews    = events.filter(e => e.event_type === 'page_view').length;
  const totalClicks   = events.filter(e => e.event_type === 'click').length;
  const uniqueVisitors = new Set(events.map(e => e.visitor_id)).size;
  const emailsCaptured = new Set(
    events.filter(e => e.visitor_email).map(e => e.visitor_email)
  ).size;

  // ── Views per day (last 14 days) ──────────────────────────────────────────
  const viewsPerDay = useMemo(() => {
    const map: Record<string, number> = {};
    events
      .filter(e => e.event_type === 'page_view')
      .forEach(e => {
        const day = formatDate(e.created_at);
        map[day] = (map[day] || 0) + 1;
      });
    return Object.entries(map)
      .map(([date, views]) => ({ date, views }))
      .slice(-14);
  }, [events]);

  // ── Clicks per day ────────────────────────────────────────────────────────
  const clicksPerDay = useMemo(() => {
    const map: Record<string, number> = {};
    events
      .filter(e => e.event_type === 'click')
      .forEach(e => {
        const day = formatDate(e.created_at);
        map[day] = (map[day] || 0) + 1;
      });
    return Object.entries(map)
      .map(([date, clicks]) => ({ date, clicks }))
      .slice(-14);
  }, [events]);

  // ── Top clicked elements ──────────────────────────────────────────────────
  const topClicks = useMemo(() => {
    const map: Record<string, number> = {};
    events
      .filter(e => e.event_type === 'click' && e.metadata?.label)
      .forEach(e => {
        const label = (e.metadata.label as string).substring(0, 40);
        map[label] = (map[label] || 0) + 1;
      });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([label, clicks]) => ({ label, clicks }));
  }, [events]);

  // ── Top cities ───────────────────────────────────────────────────────────
  const topCities = useMemo(() => {
    const map: Record<string, number> = {};
    events.forEach(e => {
      const geo = e.metadata?.geo as GeoData | undefined;
      if (geo?.city && geo?.country) {
        const key = `${countryFlag(geo.country)} ${geo.city}${geo.region ? ', ' + geo.region : ''}`;
        map[key] = (map[key] || 0) + 1;
      }
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([city, visits]) => ({ city, visits }));
  }, [events]);

  // ── Top countries ────────────────────────────────────────────────────────
  const topCountries = useMemo(() => {
    const map: Record<string, number> = {};
    events.forEach(e => {
      const geo = e.metadata?.geo as GeoData | undefined;
      if (geo?.country) {
        const key = `${countryFlag(geo.country)} ${geo.country}`;
        map[key] = (map[key] || 0) + 1;
      }
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([country, visits]) => ({ country, visits }));
  }, [events]);


  // ── Top pages ─────────────────────────────────────────────────────────────
  const topPages = useMemo(() => {
    const map: Record<string, number> = {};
    events.filter(e => e.event_type === 'page_view').forEach(e => {
      const url = e.page_url || '/';
      map[url] = (map[url] || 0) + 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([page, visits]) => ({ page, visits }));
  }, [events]);

  // ── Event type distribution ───────────────────────────────────────────────
  const eventDist = useMemo(() => {
    const map: Record<string, number> = {};
    events.forEach(e => {
      const label = EVENT_LABELS[e.event_type] || e.event_type;
      map[label] = (map[label] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [events]);

  // ── Top products ──────────────────────────────────────────────────────────
  const topProducts = useMemo(() => {
    const map: Record<string, number> = {};
    events
      .filter(
        e =>
          e.product_id &&
          (e.event_type === 'product_view' || e.event_type === 'product_download')
      )
      .forEach(e => {
        const name = productMap[e.product_id!] || e.product_id!;
        map[name] = (map[name] || 0) + 1;
      });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([product, views]) => ({
        product: product.length > 28 ? product.substring(0, 26) + '…' : product,
        views,
      }));
  }, [events, productMap]);

  // ── Recent events ─────────────────────────────────────────────────────────
  const recentEvents = events.slice(0, 30);

  const kpis = [
    { label: 'Vistas totales',     value: totalViews,     icon: '👁️', color: '#71B0B4' },
    { label: 'Visitantes únicos',  value: uniqueVisitors,  icon: '👤', color: '#4C577C' },
    { label: 'Clics capturados',   value: totalClicks,     icon: '🖱️', color: '#CD807B' },
    { label: 'Correos capturados', value: emailsCaptured,  icon: '📧', color: '#C4C371' },
  ];

  return (
    <div className="analytics-page">
      <div className="analytics-sticky-top">
        {/* Header */}
        <div className="analytics-header">
          <div>
            <h1 className="analytics-title font-forum">Analytics</h1>
            <p className="analytics-subtitle font-inter">
              Comportamiento de visitantes — Últimos 30 días
            </p>
          </div>
          <div className="analytics-badge font-inter">Live</div>
        </div>

        {/* KPI Cards */}
        <div className="analytics-kpis">
          {kpis.map(k => (
            <div key={k.label} className="analytics-kpi-card">
              <div
                className="analytics-kpi-icon"
                style={{ background: k.color + '22' }}
              >
                {k.icon}
              </div>
              <div>
                <p
                  className="analytics-kpi-value font-forum"
                  style={{ color: k.color }}
                >
                  {k.value.toLocaleString()}
                </p>
                <p className="analytics-kpi-label font-inter">{k.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {events.length === 0 && (
        <div className="analytics-empty">
          ⚠️ Aún no hay datos. Visita la tienda con el banner de cookies y los datos
          aparecerán aquí.
          <br />
          <small>
            Asegúrate de crear la tabla <strong>analytics_events</strong> en
            Supabase con el script SQL provisto.
          </small>
        </div>
      )}

      {/* Charts grid */}
      <div className="analytics-charts-grid">
        {/* Views over time */}
        <div className="analytics-chart-card analytics-chart-wide">
          <h3 className="analytics-chart-title font-forum">Vistas de página por día</h3>
          {viewsPerDay.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart
                data={viewsPerDay}
                margin={{ top: 4, right: 8, bottom: 0, left: -10 }}
              >
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#71B0B4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#71B0B4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="views"
                  name="Vistas"
                  stroke="#71B0B4"
                  strokeWidth={2}
                  fill="url(#colorViews)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="analytics-no-data">Sin datos suficientes</div>
          )}
        </div>

        {/* Clicks over time */}
        <div className="analytics-chart-card analytics-chart-wide">
          <h3 className="analytics-chart-title font-forum">Clics por día</h3>
          {clicksPerDay.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart
                data={clicksPerDay}
                margin={{ top: 4, right: 8, bottom: 0, left: -10 }}
              >
                <defs>
                  <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#CD807B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#CD807B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="clicks"
                  name="Clics"
                  stroke="#CD807B"
                  strokeWidth={2}
                  fill="url(#colorClicks)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="analytics-no-data">Sin datos aún</div>
          )}
        </div>

        {/* Top clicked elements */}
        <div className="analytics-chart-card analytics-chart-wide">
          <h3 className="analytics-chart-title font-forum">
            Elementos más clickeados
          </h3>
          {topClicks.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={topClicks}
                layout="vertical"
                margin={{ top: 0, right: 16, bottom: 0, left: 140 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f0f0f0"
                  horizontal={false}
                />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="label"
                  tick={{ fontSize: 11 }}
                  width={136}
                />
                <Tooltip />
                <Bar
                  dataKey="clicks"
                  name="Clics"
                  fill="#CD807B"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="analytics-no-data">Sin datos aún</div>
          )}
        </div>

        {/* Top Cities */}
        <div className="analytics-chart-card analytics-chart-wide">
          <h3 className="analytics-chart-title font-forum">📍 Ciudades de origen</h3>
          {topCities.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={topCities}
                layout="vertical"
                margin={{ top: 0, right: 16, bottom: 0, left: 170 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="city" tick={{ fontSize: 11 }} width={166} />
                <Tooltip />
                <Bar dataKey="visits" name="Visitas" fill="#71B0B4" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="analytics-no-data">Sin datos geo aún — los nuevos eventos incluirán la ciudad automáticamente</div>
          )}
        </div>

        {/* Top Countries */}
        <div className="analytics-chart-card">
          <h3 className="analytics-chart-title font-forum">🌍 Países</h3>
          {topCountries.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={topCountries}
                layout="vertical"
                margin={{ top: 0, right: 16, bottom: 0, left: 50 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="country" tick={{ fontSize: 12 }} width={46} />
                <Tooltip />
                <Bar dataKey="visits" name="Visitas" fill="#4C577C" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="analytics-no-data">Sin datos geo aún</div>
          )}
        </div>


        <div className="analytics-chart-card">
          <h3 className="analytics-chart-title font-forum">
            Páginas más visitadas
          </h3>
          {topPages.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={topPages}
                layout="vertical"
                margin={{ top: 0, right: 8, bottom: 0, left: 50 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f0f0f0"
                  horizontal={false}
                />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="page"
                  tick={{ fontSize: 10 }}
                  width={50}
                />
                <Tooltip />
                <Bar
                  dataKey="visits"
                  name="Visitas"
                  fill="#4C577C"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="analytics-no-data">Sin datos</div>
          )}
        </div>

        {/* Event distribution */}
        <div className="analytics-chart-card">
          <h3 className="analytics-chart-title font-forum">
            Distribución de eventos
          </h3>
          {eventDist.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={eventDist}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) =>
                    `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                  fontSize={10}
                >
                  {eventDist.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="analytics-no-data">Sin datos</div>
          )}
        </div>

        {/* Top products */}
        {topProducts.length > 0 && (
          <div className="analytics-chart-card analytics-chart-wide">
            <h3 className="analytics-chart-title font-forum">
              Productos más vistos / descargados
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={topProducts}
                margin={{ top: 4, right: 8, bottom: 40, left: -10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="product"
                  tick={{ fontSize: 10 }}
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar
                  dataKey="views"
                  name="Interacciones"
                  fill="#C4C371"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Recent events table */}
      <div className="analytics-table-card">
        <h3 className="analytics-chart-title font-forum">Eventos recientes</h3>
        <div className="analytics-table-wrap">
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Página</th>
                <th>Detalle (clic / producto)</th>
                <th>Email</th>
                <th>Visitor</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {recentEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="analytics-empty-row">
                    Sin eventos todavía
                  </td>
                </tr>
              ) : (
                recentEvents.map(e => (
                  <tr key={e.id}>
                    <td>
                      <span
                        className={`analytics-event-badge analytics-event-${e.event_type}`}
                      >
                        {EVENT_LABELS[e.event_type] || e.event_type}
                      </span>
                    </td>
                    <td className="analytics-table-page">
                      {e.page_url || '/'}
                    </td>
                    <td className="analytics-table-page">
                      {e.event_type === 'click' && e.metadata?.label
                        ? `🖱️ ${e.metadata.label}`
                        : e.product_id
                        ? productMap[e.product_id] || e.product_id
                        : '—'}
                    </td>
                    <td>
                      {e.visitor_email || (
                        <span className="analytics-anon">Anónimo</span>
                      )}
                    </td>
                    <td className="analytics-anon">
                      {e.visitor_id?.substring(0, 8)}…
                    </td>
                    <td>
                      {new Date(e.created_at).toLocaleString('es-CO', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
