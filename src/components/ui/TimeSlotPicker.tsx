'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { getAvailability, type Slot } from '@/lib/booking-availability-cache';
import { getColombianHolidays } from '@/lib/colombia-holidays';

export type { Slot };

const WEEKDAY_HEADERS = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
const WEEKDAY_ORDER = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface DayEntry {
  key: string;
  slots: Slot[];
  dayNum: number;
}

interface MonthMeta {
  monthKey: string;
  year: number;
  month: number; // 1-12
  label: string;
}

export interface UseAvailabilityResult {
  slots: Slot[] | null;
  error: string | null;
  daysByKey: Map<string, DayEntry>;
}

export function useAvailability(timeZone: string, calendarId: string): UseAvailabilityResult {
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getAvailability(calendarId)
      .then((data) => {
        if (!cancelled) {
          setSlots(data.slots);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) setError('No se pudo cargar la disponibilidad. Intenta de nuevo en unos minutos.');
      });
    return () => {
      cancelled = true;
    };
  }, [calendarId]);

  const dayKeyFmt = useMemo(
    () => new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }),
    [timeZone]
  );

  const daysByKey = useMemo(() => {
    const map = new Map<string, DayEntry>();
    if (!slots) return map;
    for (const slot of slots) {
      const key = dayKeyFmt.format(new Date(slot.start));
      const existing = map.get(key);
      if (existing) {
        existing.slots.push(slot);
      } else {
        map.set(key, { key, slots: [slot], dayNum: Number(key.slice(8, 10)) });
      }
    }
    return map;
  }, [slots, dayKeyFmt]);

  return { slots, error, daysByKey };
}

interface CalendarDayPickerProps {
  timeZone: string;
  daysByKey: Map<string, DayEntry>;
  loading: boolean;
  error: string | null;
  onSelectDay: (iso: string) => void;
}

export function CalendarDayPicker({ timeZone, daysByKey, loading, error, onSelectDay }: CalendarDayPickerProps) {
  const [monthIndex, setMonthIndex] = useState(0);

  const monthLabelFmt = useMemo(
    () => new Intl.DateTimeFormat('es-CO', { timeZone, month: 'long', year: 'numeric' }),
    [timeZone]
  );
  const dayKeyFmt = useMemo(
    () => new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }),
    [timeZone]
  );
  const todayIso = useMemo(() => dayKeyFmt.format(new Date()), [dayKeyFmt]);

  const months: MonthMeta[] = useMemo(() => {
    const map = new Map<string, MonthMeta>();
    for (const key of daysByKey.keys()) {
      const monthKey = key.slice(0, 7);
      if (!map.has(monthKey)) {
        const [y, m] = monthKey.split('-').map(Number);
        map.set(monthKey, {
          monthKey,
          year: y,
          month: m,
          label: monthLabelFmt.format(new Date(Date.UTC(y, m - 1, 15))),
        });
      }
    }
    return Array.from(map.values());
  }, [daysByKey, monthLabelFmt]);

  const holidaysByYear = useMemo(() => {
    const map = new Map<number, Set<string>>();
    for (const m of months) {
      if (!map.has(m.year)) map.set(m.year, getColombianHolidays(m.year));
    }
    return map;
  }, [months]);

  if (error) {
    return <p className="booking-slot-error">{error}</p>;
  }

  if (loading) {
    return <p className="booking-slot-loading">Cargando horarios disponibles…</p>;
  }

  if (months.length === 0) {
    return <p className="booking-slot-error">No hay horarios disponibles en este momento. Escríbenos por WhatsApp.</p>;
  }

  const current = months[Math.min(monthIndex, months.length - 1)];
  const daysInMonth = new Date(current.year, current.month, 0).getDate();
  const weekdayOfDay1 = WEEKDAY_ORDER.indexOf(
    new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'short' }).format(
      new Date(Date.UTC(current.year, current.month - 1, 1, 12))
    )
  );
  const holidays = holidaysByYear.get(current.year) ?? new Set<string>();

  const cells = [
    ...Array.from({ length: weekdayOfDay1 }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const dayNum = i + 1;
      const weekday = (weekdayOfDay1 + i) % 7;
      const iso = `${current.year}-${String(current.month).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const entry = daysByKey.get(iso) ?? null;
      return { dayNum, weekday, iso, entry };
    }),
  ];

  return (
    <div className="booking-calendar">
      <div className="booking-calendar-nav">
        <button
          type="button"
          className="booking-calendar-arrow"
          onClick={() => setMonthIndex((i) => Math.max(0, i - 1))}
          disabled={monthIndex === 0}
          aria-label="Mes anterior"
        >
          ‹
        </button>
        <p className="booking-calendar-month font-inter">{current.label}</p>
        <button
          type="button"
          className="booking-calendar-arrow"
          onClick={() => setMonthIndex((i) => Math.min(months.length - 1, i + 1))}
          disabled={monthIndex >= months.length - 1}
          aria-label="Mes siguiente"
        >
          ›
        </button>
      </div>
      <div className="booking-calendar-grid">
        {WEEKDAY_HEADERS.map((w, i) => (
          <span key={i} className={`booking-calendar-weekday${i === 0 || i === 6 ? ' is-weekend' : ''}`}>{w}</span>
        ))}
        {cells.map((cell, i) => {
          if (!cell) return <span key={`blank-${i}`} className="booking-calendar-day is-empty" />;
          const isWeekend = cell.weekday === 0 || cell.weekday === 6;
          const isHoliday = holidays.has(cell.iso);
          const isAvailable = Boolean(cell.entry);
          const isToday = cell.iso === todayIso;
          const classes = [
            'booking-calendar-day',
            !isAvailable ? 'is-disabled' : '',
            isWeekend ? 'is-weekend' : '',
            isHoliday ? 'is-holiday' : '',
            isToday ? 'is-today' : '',
          ].filter(Boolean).join(' ');
          return (
            <button
              key={cell.iso}
              type="button"
              className={classes}
              disabled={!isAvailable}
              title={isHoliday ? 'Festivo en Colombia' : undefined}
              onClick={() => onSelectDay(cell.iso)}
            >
              {cell.dayNum}
            </button>
          );
        })}
      </div>
      <div className="booking-calendar-legend">
        <span><i className="dot is-weekend" /> Fin de semana</span>
        <span><i className="dot is-holiday" /> Festivo</span>
        <span><i className="dot is-today" /> Hoy</span>
      </div>
    </div>
  );
}

interface TimeHourGridProps {
  daySlots: Slot[];
  selected: Slot | null;
  onSelect: (slot: Slot) => void;
  timeZone: string;
}

export function TimeHourGrid({ daySlots, selected, onSelect, timeZone }: TimeHourGridProps) {
  const timeFmt = useMemo(
    () => new Intl.DateTimeFormat('es-CO', { timeZone, hour: 'numeric', minute: '2-digit', hour12: true }),
    [timeZone]
  );

  return (
    <div className="booking-time-grid">
      {daySlots.map((slot, i) => (
        <button
          key={slot.start}
          type="button"
          style={{ animationDelay: `${Math.min(i, 12) * 28}ms` }}
          className={`booking-time-btn${selected?.start === slot.start ? ' active' : ''}`}
          onClick={() => onSelect(slot)}
        >
          {timeFmt.format(new Date(slot.start))}
        </button>
      ))}
    </div>
  );
}
