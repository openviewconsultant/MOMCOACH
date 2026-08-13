export interface Slot {
  start: string;
  end: string;
}

interface AvailabilityResponse {
  slots: Slot[];
  timeZone: string;
}

const CACHE_TTL_MS = 60_000;

interface CacheEntry {
  promise: Promise<AvailabilityResponse>;
  cachedAt: number;
}

const cache = new Map<string, CacheEntry>();

function fetchAvailability(calendarId: string): Promise<AvailabilityResponse> {
  return fetch(`/api/booking/disponibilidad?calendarId=${encodeURIComponent(calendarId)}`).then(async (res) => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'No se pudo cargar la disponibilidad');
    return data as AvailabilityResponse;
  });
}

// Comparte una única promesa de disponibilidad por calendario entre todos
// los pickers que se monten en la página (durante un rato corto), para que
// al abrir un modal de reserva los horarios ya estén cargados en vez de
// mostrar un estado de carga.
export function getAvailability(calendarId: string): Promise<AvailabilityResponse> {
  const entry = cache.get(calendarId);
  const isStale = !entry || Date.now() - entry.cachedAt > CACHE_TTL_MS;
  if (isStale) {
    const promise = fetchAvailability(calendarId);
    cache.set(calendarId, { promise, cachedAt: Date.now() });
    return promise;
  }
  return entry.promise;
}

export function prefetchAvailability(calendarId: string): void {
  getAvailability(calendarId).catch(() => {
    // Si el prefetch falla, TimeSlotPicker reintentará al montarse.
    cache.delete(calendarId);
  });
}
