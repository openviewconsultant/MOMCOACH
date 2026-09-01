'use client';

import React, { useState } from 'react';

interface CalendarOption {
  id: string;
  name: string;
}

interface Props {
  initialSettings: Record<string, string>;
  calendarOptions: CalendarOption[];
}

const DEFAULT_EYEBROW  = 'Agenda tu';
const DEFAULT_TITLE    = 'Llamada de descubrimiento';
const DEFAULT_SUBTITLE = '¡sin costo!';
const DEFAULT_CTA      = 'Agenda aquí';
const DEFAULT_CALENDAR_ID = 'default';

export default function PopupSettingsForm({ initialSettings, calendarOptions }: Props) {
  const [eyebrow,  setEyebrow]  = useState(initialSettings['popup_eyebrow']  ?? DEFAULT_EYEBROW);
  const [title,    setTitle]    = useState(initialSettings['popup_title']    ?? DEFAULT_TITLE);
  const [subtitle, setSubtitle] = useState(initialSettings['popup_subtitle'] ?? DEFAULT_SUBTITLE);
  const [cta,      setCta]      = useState(initialSettings['popup_cta']      ?? DEFAULT_CTA);
  const [enabled,  setEnabled]  = useState((initialSettings['popup_enabled'] ?? 'true') === 'true');
  const [calendarId, setCalendarId] = useState(initialSettings['popup_calendar_id'] ?? DEFAULT_CALENDAR_ID);

  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState('');

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          popup_eyebrow:  eyebrow,
          popup_title:    title,
          popup_subtitle: subtitle,
          popup_cta:      cta,
          popup_enabled:  String(enabled),
          popup_calendar_id: calendarId,
        }),
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

  return (
    <div className="admin-settings-page">
      <div className="admin-settings-header">
        <div>
          <h1 className="admin-settings-title font-fraunces">Mensaje PopUp</h1>
          <p className="admin-settings-subtitle font-inter">
            Gestiona el popup de llamada de descubrimiento que aparece en el sitio
          </p>
        </div>
      </div>

      <div className="admin-settings-grid">
        {/* ── Form ────────────────────────────────────── */}
        <form className="admin-settings-card" onSubmit={handleSave}>
          <div className="admin-settings-card-header">
            <span className="admin-settings-card-icon">🗓️</span>
            <h2 className="admin-settings-card-title font-fraunces">Popup de agenda</h2>
            <label className="admin-toggle" title="Habilitar popup">
              <input
                type="checkbox"
                checked={enabled}
                onChange={e => setEnabled(e.target.checked)}
              />
              <span className="admin-toggle-track" />
            </label>
            <span className="admin-toggle-label font-inter">
              {enabled ? 'Activo' : 'Desactivado'}
            </span>
          </div>

          <div className="admin-settings-fields">
            <p className="admin-field-hint">
              El horario de la llamada gratuita se agenda con Google Calendar. Crea o ajusta calendarios en <b>Calendario</b> en el menú lateral.
            </p>

            {/* Calendario asociado */}
            <div className="admin-field">
              <label className="admin-field-label font-inter" htmlFor="ps-calendar">
                Calendario donde se agenda esta llamada
              </label>
              <select
                id="ps-calendar"
                className="admin-field-input font-inter"
                value={calendarId}
                onChange={e => setCalendarId(e.target.value)}
              >
                {calendarOptions.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Eyebrow */}
            <div className="admin-field">
              <label className="admin-field-label font-inter" htmlFor="ps-eyebrow">
                Texto pequeño (encima del título)
              </label>
              <input
                id="ps-eyebrow"
                type="text"
                className="admin-field-input font-inter"
                value={eyebrow}
                onChange={e => setEyebrow(e.target.value)}
                placeholder={DEFAULT_EYEBROW}
              />
            </div>

            {/* Title */}
            <div className="admin-field">
              <label className="admin-field-label font-inter" htmlFor="ps-title">
                Título principal
              </label>
              <input
                id="ps-title"
                type="text"
                className="admin-field-input font-inter"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder={DEFAULT_TITLE}
              />
            </div>

            {/* Subtitle */}
            <div className="admin-field">
              <label className="admin-field-label font-inter" htmlFor="ps-subtitle">
                Subtítulo destacado
              </label>
              <input
                id="ps-subtitle"
                type="text"
                className="admin-field-input font-inter"
                value={subtitle}
                onChange={e => setSubtitle(e.target.value)}
                placeholder={DEFAULT_SUBTITLE}
              />
            </div>

            {/* CTA */}
            <div className="admin-field">
              <label className="admin-field-label font-inter" htmlFor="ps-cta">
                Texto del botón
              </label>
              <input
                id="ps-cta"
                type="text"
                className="admin-field-input font-inter"
                value={cta}
                onChange={e => setCta(e.target.value)}
                placeholder={DEFAULT_CTA}
              />
            </div>
          </div>

          {error && (
            <p className="admin-settings-error font-inter">⚠️ {error}</p>
          )}

          <div className="admin-settings-actions">
            <button
              type="submit"
              className="admin-settings-save-btn font-inter"
              disabled={saving}
            >
              {saving ? 'Guardando…' : saved ? '✅ ¡Guardado!' : 'Guardar cambios'}
            </button>
          </div>
        </form>

        {/* ── Live Preview ─────────────────────────────── */}
        <div className="admin-settings-card admin-popup-preview-wrap">
          <div className="admin-settings-card-header">
            <span className="admin-settings-card-icon">👁️</span>
            <h2 className="admin-settings-card-title font-fraunces">Vista previa</h2>
          </div>

          <div className="admin-popup-preview-stage">
            <div className="admin-popup-preview">
              <div className="admin-popup-preview-media">
                <video
                  src="/discovery-popup-bg.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="admin-popup-preview-video"
                />
                <div className="admin-popup-preview-overlay">
                  <span className="admin-popup-preview-eyebrow">{eyebrow}</span>
                  <h3 className="admin-popup-preview-title">{title}</h3>
                  <span className="admin-popup-preview-highlight">{subtitle}</span>
                  <button type="button" className="admin-popup-preview-cta">{cta}</button>
                </div>
              </div>
              <button type="button" className="admin-popup-preview-close">✕</button>
            </div>
            {!enabled && (
              <div className="admin-popup-preview-disabled-overlay font-inter">
                Popup desactivado
              </div>
            )}
          </div>

          <p className="admin-popup-preview-note font-inter">
            El popup aparece cuando el visitante hace scroll en la página de inicio.
          </p>
        </div>
      </div>
    </div>
  );
}
