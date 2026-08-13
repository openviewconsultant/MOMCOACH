import { google } from 'googleapis';

// Las cuentas de servicio no pueden escribir eventos en calendarios de Gmail
// personales (solo en Google Workspace con delegación de dominio) — la API
// responde 404 en `events.insert` aunque el calendario esté "compartido".
// Por eso se usa OAuth2 con un refresh token obtenido una sola vez con
// `node scripts/google-oauth-setup.mjs` (ver ese archivo). El mismo token
// autoriza el acceso a todos los calendarios de esa cuenta de Google, así
// que se puede leer/escribir en varios calendarios (uno por servicio) sin
// volver a autorizar nada.
function getAuth() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      'Faltan las variables de entorno GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET y/o GOOGLE_OAUTH_REFRESH_TOKEN'
    );
  }

  const client = new google.auth.OAuth2(clientId, clientSecret);
  client.setCredentials({ refresh_token: refreshToken });
  return client;
}

export interface BusyInterval {
  start: string;
  end: string;
}

export async function getBusyIntervals(timeMin: Date, timeMax: Date, calendarId: string): Promise<BusyInterval[]> {
  const calendar = google.calendar({ version: 'v3', auth: getAuth() });

  const { data } = await calendar.freebusy.query({
    requestBody: {
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      items: [{ id: calendarId }],
    },
  });

  const busy = data.calendars?.[calendarId]?.busy ?? [];
  return busy
    .filter((b): b is { start: string; end: string } => Boolean(b.start && b.end))
    .map((b) => ({ start: b.start, end: b.end }));
}

export interface CreateEventParams {
  calendarId: string;
  summary: string;
  description?: string;
  start: Date;
  end: Date;
  timeZone: string;
  attendeeEmail: string;
  attendeeName?: string;
}

export interface CreatedEvent {
  eventId: string;
  meetLink: string | null;
  htmlLink: string | null;
}

export async function createCalendarEvent(params: CreateEventParams): Promise<CreatedEvent> {
  const calendar = google.calendar({ version: 'v3', auth: getAuth() });
  const { calendarId } = params;

  const baseRequestBody = {
    summary: params.summary,
    description: params.description,
    start: { dateTime: params.start.toISOString(), timeZone: params.timeZone },
    end: { dateTime: params.end.toISOString(), timeZone: params.timeZone },
    attendees: [{ email: params.attendeeEmail, displayName: params.attendeeName }],
  };

  // Algunas cuentas de Gmail personales (no Workspace) no permiten que una
  // cuenta de servicio genere un enlace de Google Meet automático — la API
  // responde 404. En ese caso, se crea el evento igual pero sin Meet en vez
  // de bloquear la cita por completo.
  try {
    const { data } = await calendar.events.insert({
      calendarId,
      sendUpdates: 'all',
      conferenceDataVersion: 1,
      requestBody: {
        ...baseRequestBody,
        conferenceData: {
          createRequest: {
            requestId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      },
    });
    return { eventId: data.id ?? '', meetLink: data.hangoutLink ?? null, htmlLink: data.htmlLink ?? null };
  } catch (error) {
    console.error('No se pudo crear el evento con Google Meet, se crea sin videollamada', error);
    const { data } = await calendar.events.insert({
      calendarId,
      sendUpdates: 'all',
      requestBody: baseRequestBody,
    });
    return { eventId: data.id ?? '', meetLink: null, htmlLink: data.htmlLink ?? null };
  }
}

export async function cancelCalendarEvent(calendarId: string, eventId: string): Promise<void> {
  const calendar = google.calendar({ version: 'v3', auth: getAuth() });
  await calendar.events.delete({ calendarId, eventId, sendUpdates: 'all' });
}
