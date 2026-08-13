'use client';

import React, { useState } from 'react';

interface Props {
  initialSettings: Record<string, string>;
}

interface BlockedRange {
  date: string;
  startTime: string;
  endTime: string;
}

interface CalendarForm {
  id: string;
  name: string;
  googleCalendarId: string;
  slotMinutes: number;
  dayStartHour: number;
  dayEndHour: number;
  workingDays: number[];
  advanceDays: number;
  minNoticeHours: number;
  blockedDates: string[];
  blockedRanges: BlockedRange[];
}

const WEEKDAYS = [
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mié' },
  { value: 4, label: 'Jue' },
  { value: 5, label: 'Vie' },
  { value: 6, label: 'Sáb' },
  { value: 0, label: 'Dom' },
];

const HOURS = Array.from({ length: 24 }, (_, i) => i);

const BLANK_DEFAULTS = {
  slotMinutes: 30,
  dayStartHour: 8,
  dayEndHour: 19,
  workingDays: [1, 2, 3, 4, 5, 6],
  advanceDays: 21,
  minNoticeHours: 12,
  blockedDates: [] as string[],
  blockedRanges: [] as BlockedRange[],
};

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'calendario';
}

function parseCalendars(raw: string | undefined): CalendarForm[] {
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((c): CalendarForm => ({
          id: String(c.id ?? 'default'),
          name: String(c.name ?? 'Calendario'),
          googleCalendarId: String(c.googleCalendarId ?? ''),
          slotMinutes: Number(c.slotMinutes) > 0 ? Number(c.slotMinutes) : BLANK_DEFAULTS.slotMinutes,
          dayStartHour: Number.isFinite(Number(c.dayStartHour)) ? Number(c.dayStartHour) : BLANK_DEFAULTS.dayStartHour,
          dayEndHour: Number.isFinite(Number(c.dayEndHour)) ? Number(c.dayEndHour) : BLANK_DEFAULTS.dayEndHour,
          workingDays: Array.isArray(c.workingDays) && c.workingDays.length > 0 ? c.workingDays.map(Number) : BLANK_DEFAULTS.workingDays,
          advanceDays: Number(c.advanceDays) > 0 ? Number(c.advanceDays) : BLANK_DEFAULTS.advanceDays,
          minNoticeHours: Number.isFinite(Number(c.minNoticeHours)) ? Number(c.minNoticeHours) : BLANK_DEFAULTS.minNoticeHours,
          blockedDates: Array.isArray(c.blockedDates) ? c.blockedDates.filter((d: unknown) => typeof d === 'string') : [],
          blockedRanges: Array.isArray(c.blockedRanges)
            ? c.blockedRanges.filter(
                (r: unknown): r is BlockedRange =>
                  !!r && typeof r === 'object' &&
                  typeof (r as BlockedRange).date === 'string' &&
                  typeof (r as BlockedRange).startTime === 'string' &&
                  typeof (r as BlockedRange).endTime === 'string'
              )
            : [],
        }));
      }
    } catch {
      // ignora JSON inválido, cae al default de abajo
    }
  }
  return [{ id: 'default', name: 'General', googleCalendarId: '', ...BLANK_DEFAULTS }];
}

export default function CalendarSettingsForm({ initialSettings }: Props) {
  const [calendars, setCalendars] = useState<CalendarForm[]>(parseCalendars(initialSettings['booking_calendars']));
  const [newDateByCalendar, setNewDateByCalendar] = useState<Record<string, string>>({});
  const [newRangeByCalendar, setNewRangeByCalendar] = useState<Record<string, { date: string; startTime: string; endTime: string }>>({});

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  function updateCalendar(id: string, patch: Partial<CalendarForm>) {
    setCalendars((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  function toggleWorkingDay(id: string, day: number) {
    setCalendars((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, workingDays: c.workingDays.includes(day) ? c.workingDays.filter((d) => d !== day) : [...c.workingDays, day].sort() }
          : c
      )
    );
  }

  function addCalendar() {
    const name = `Calendario ${calendars.length + 1}`;
    let id = slugify(name);
    while (calendars.some((c) => c.id === id)) id = `${id}-${Math.random().toString(36).slice(2, 5)}`;
    setCalendars((prev) => [...prev, { id, name, googleCalendarId: '', ...BLANK_DEFAULTS }]);
  }

  function removeCalendar(id: string) {
    if (calendars.length <= 1) return;
    if (!confirm('¿Quitar este calendario? Los productos que lo tengan asignado volverán al calendario "General".')) return;
    setCalendars((prev) => prev.filter((c) => c.id !== id));
  }

  function addBlockedDate(id: string) {
    const date = newDateByCalendar[id];
    if (!date) return;
    updateCalendar(id, {
      blockedDates: Array.from(new Set([...(calendars.find((c) => c.id === id)?.blockedDates ?? []), date])).sort(),
    });
    setNewDateByCalendar((prev) => ({ ...prev, [id]: '' }));
  }

  function removeBlockedDate(id: string, date: string) {
    const cal = calendars.find((c) => c.id === id);
    if (!cal) return;
    updateCalendar(id, { blockedDates: cal.blockedDates.filter((d) => d !== date) });
  }

  function addBlockedRange(id: string) {
    const draft = newRangeByCalendar[id];
    if (!draft?.date || !draft?.startTime || !draft?.endTime) return;
    if (draft.startTime >= draft.endTime) return;
    const cal = calendars.find((c) => c.id === id);
    if (!cal) return;
    updateCalendar(id, { blockedRanges: [...cal.blockedRanges, draft] });
    setNewRangeByCalendar((prev) => ({ ...prev, [id]: { date: '', startTime: '', endTime: '' } }));
  }

  function removeBlockedRange(id: string, index: number) {
    const cal = calendars.find((c) => c.id === id);
    if (!cal) return;
    updateCalendar(id, { blockedRanges: cal.blockedRanges.filter((_, i) => i !== index) });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_calendars: JSON.stringify(calendars) }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Error desconocido');
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  const todayIso = new Date().toISOString().slice(0, 10);

  return (
    <div className="admin-settings-page">
      <div className="admin-settings-header">
        <div>
          <h1 className="admin-settings-title font-forum">Calendario</h1>
          <p className="admin-settings-subtitle font-inter">
            Un calendario por servicio (ej. Sueño, Alimentación), cada uno con su propio Google Calendar, duración y horario. La disponibilidad real siempre se cruza con el Google Calendar de cada uno.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: 680 }}>
        {calendars.map((cal) => (
          <div key={cal.id} className="admin-settings-card">
            <div className="admin-settings-card-header">
              <span className="admin-settings-card-icon">📅</span>
              <input
                type="text"
                className="admin-field-input font-inter"
                style={{ fontWeight: 700, maxWidth: 260 }}
                value={cal.name}
                onChange={(e) => updateCalendar(cal.id, { name: e.target.value })}
              />
              {calendars.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCalendar(cal.id)}
                  className="font-inter"
                  style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--color-terracotta)', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Quitar
                </button>
              )}
            </div>

            <div className="admin-settings-fields">
              <div className="admin-field">
                <label className="admin-field-label font-inter">
                  ID del Google Calendar
                  <span className="admin-field-hint">El correo del calendario, ej. tucuenta@gmail.com</span>
                </label>
                <input
                  type="text"
                  className="admin-field-input font-inter"
                  placeholder="tucuenta@gmail.com"
                  value={cal.googleCalendarId}
                  onChange={(e) => updateCalendar(cal.id, { googleCalendarId: e.target.value })}
                />
              </div>

              <div className="admin-field">
                <label className="admin-field-label font-inter">Duración de cada cita</label>
                <select
                  className="admin-field-input font-inter"
                  value={cal.slotMinutes}
                  onChange={(e) => updateCalendar(cal.id, { slotMinutes: Number(e.target.value) })}
                >
                  <option value={15}>15 minutos</option>
                  <option value={30}>30 minutos</option>
                  <option value={45}>45 minutos</option>
                  <option value={60}>60 minutos</option>
                </select>
              </div>

              <div className="admin-form-row">
                <div className="admin-field">
                  <label className="admin-field-label font-inter">Hora de inicio</label>
                  <select
                    className="admin-field-input font-inter"
                    value={cal.dayStartHour}
                    onChange={(e) => updateCalendar(cal.id, { dayStartHour: Number(e.target.value) })}
                  >
                    {HOURS.map((h) => (
                      <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
                    ))}
                  </select>
                </div>
                <div className="admin-field">
                  <label className="admin-field-label font-inter">Hora de cierre</label>
                  <select
                    className="admin-field-input font-inter"
                    value={cal.dayEndHour}
                    onChange={(e) => updateCalendar(cal.id, { dayEndHour: Number(e.target.value) })}
                  >
                    {HOURS.map((h) => (
                      <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="admin-field">
                <label className="admin-field-label font-inter">Días que atiendes</label>
                <div className="admin-pill-group">
                  {WEEKDAYS.map((wd) => (
                    <label key={wd.value} className={`admin-pill ${cal.workingDays.includes(wd.value) ? 'is-active' : ''}`}>
                      <input
                        type="checkbox"
                        checked={cal.workingDays.includes(wd.value)}
                        onChange={() => toggleWorkingDay(cal.id, wd.value)}
                      />
                      {wd.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-field">
                  <label className="admin-field-label font-inter">
                    Días de anticipación
                    <span className="admin-field-hint">Cuántos días hacia adelante se puede agendar</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={90}
                    className="admin-field-input font-inter"
                    value={cal.advanceDays}
                    onChange={(e) => updateCalendar(cal.id, { advanceDays: Number(e.target.value) })}
                  />
                </div>
                <div className="admin-field">
                  <label className="admin-field-label font-inter">
                    Aviso mínimo (horas)
                    <span className="admin-field-hint">No se agenda con menos anticipación que esto</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={168}
                    className="admin-field-input font-inter"
                    value={cal.minNoticeHours}
                    onChange={(e) => updateCalendar(cal.id, { minNoticeHours: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="admin-field">
                <label className="admin-field-label font-inter">
                  Días bloqueados
                  <span className="admin-field-hint">Además de lo ocupado en Google Calendar (vacaciones, días libres, etc)</span>
                </label>
                <div className="admin-form-row" style={{ alignItems: 'flex-end', gridTemplateColumns: '1fr auto' }}>
                  <input
                    type="date"
                    className="admin-field-input font-inter"
                    min={todayIso}
                    value={newDateByCalendar[cal.id] ?? ''}
                    onChange={(e) => setNewDateByCalendar((prev) => ({ ...prev, [cal.id]: e.target.value }))}
                  />
                  <button
                    type="button"
                    className="admin-settings-save-btn font-inter"
                    onClick={() => addBlockedDate(cal.id)}
                    style={{ height: 42 }}
                  >
                    + Bloquear
                  </button>
                </div>
                {cal.blockedDates.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                    {cal.blockedDates.map((date) => (
                      <span key={date} className="admin-badge rejected" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        {date}
                        <button
                          type="button"
                          onClick={() => removeBlockedDate(cal.id, date)}
                          aria-label={`Quitar bloqueo de ${date}`}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 700, padding: 0 }}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="admin-field">
                <label className="admin-field-label font-inter">
                  Bloquear una franja horaria
                  <span className="admin-field-hint">Bloquea solo un rango de horas en un día específico (ej. 2:00pm a 4:00pm), sin bloquear el resto del día</span>
                </label>
                <div className="admin-form-row" style={{ gridTemplateColumns: '1fr 1fr 1fr', alignItems: 'flex-end', gap: '8px' }}>
                  <input
                    type="date"
                    className="admin-field-input font-inter"
                    min={todayIso}
                    value={newRangeByCalendar[cal.id]?.date ?? ''}
                    onChange={(e) =>
                      setNewRangeByCalendar((prev) => ({
                        ...prev,
                        [cal.id]: { date: e.target.value, startTime: prev[cal.id]?.startTime ?? '', endTime: prev[cal.id]?.endTime ?? '' },
                      }))
                    }
                  />
                  <input
                    type="time"
                    className="admin-field-input font-inter"
                    value={newRangeByCalendar[cal.id]?.startTime ?? ''}
                    onChange={(e) =>
                      setNewRangeByCalendar((prev) => ({
                        ...prev,
                        [cal.id]: { date: prev[cal.id]?.date ?? '', startTime: e.target.value, endTime: prev[cal.id]?.endTime ?? '' },
                      }))
                    }
                  />
                  <input
                    type="time"
                    className="admin-field-input font-inter"
                    value={newRangeByCalendar[cal.id]?.endTime ?? ''}
                    onChange={(e) =>
                      setNewRangeByCalendar((prev) => ({
                        ...prev,
                        [cal.id]: { date: prev[cal.id]?.date ?? '', startTime: prev[cal.id]?.startTime ?? '', endTime: e.target.value },
                      }))
                    }
                  />
                </div>
                <button
                  type="button"
                  className="admin-settings-save-btn font-inter"
                  onClick={() => addBlockedRange(cal.id)}
                  style={{ height: 38, marginTop: '8px' }}
                >
                  + Bloquear franja
                </button>
                {cal.blockedRanges.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                    {cal.blockedRanges.map((r, i) => (
                      <span key={`${r.date}-${r.startTime}-${i}`} className="admin-badge rejected" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        {r.date} · {r.startTime}–{r.endTime}
                        <button
                          type="button"
                          onClick={() => removeBlockedRange(cal.id, i)}
                          aria-label={`Quitar bloqueo de franja ${r.date} ${r.startTime}-${r.endTime}`}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 700, padding: 0 }}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addCalendar}
          className="admin-settings-card font-inter"
          style={{ textAlign: 'center', color: 'var(--color-turquoise)', fontWeight: 600, cursor: 'pointer', border: '2px dashed rgba(113,176,180,0.4)', boxShadow: 'none' }}
        >
          + Agregar otro calendario
        </button>

        {error && <p className="admin-settings-error font-inter">⚠️ {error}</p>}

        <div className="admin-settings-actions">
          <button type="submit" className="admin-settings-save-btn font-inter" disabled={saving}>
            {saving ? 'Guardando…' : saved ? '✅ ¡Guardado!' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
