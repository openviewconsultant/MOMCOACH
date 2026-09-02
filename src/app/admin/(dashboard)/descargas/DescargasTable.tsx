'use client';

import { formatDateTimeCO } from '@/lib/format';
import { useBulkDelete } from '../useBulkDelete';
import { deleteDownloadEventsAction, deleteAllDownloadEventsAction } from '../../actions';

export interface DownloadRow {
  id: string;
  email: string | null;
  resource: string;
  created_at: string;
  location: string;
}

export default function DescargasTable({ rows }: { rows: DownloadRow[] }) {
  const { selected, toggleOne, toggleAll, allSelected, bar } = useBulkDelete({
    allIds: rows.map((r) => r.id),
    deleteSelected: deleteDownloadEventsAction,
    deleteAll: deleteAllDownloadEventsAction,
    labels: { one: 'descarga', many: 'descargas' },
  });

  return (
    <>
      {bar}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: 36 }}>
                <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Seleccionar todos" />
              </th>
              <th>Fecha</th>
              <th>Correo</th>
              <th>Recurso</th>
              <th>Ubicación</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className={selected.has(r.id) ? 'is-selected' : undefined}>
                <td>
                  <input
                    type="checkbox"
                    checked={selected.has(r.id)}
                    onChange={() => toggleOne(r.id)}
                    aria-label="Seleccionar descarga"
                  />
                </td>
                <td>{formatDateTimeCO(r.created_at)}</td>
                <td className="admin-cell-wrap">{r.email || '—'}</td>
                <td className="admin-cell-wrap">{r.resource}</td>
                <td className="admin-cell-wrap">{r.location || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
