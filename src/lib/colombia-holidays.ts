// Festivos de Colombia, calculados por año (incluye los que se trasladan al
// lunes siguiente por la Ley Emiliani y los que dependen de la fecha de
// Pascua). Devuelve un Set de fechas en formato "YYYY-MM-DD".

function easterSunday(year: number): { month: number; day: number } {
  // Algoritmo de Meeus/Jones/Butcher (calendario gregoriano).
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return { month, day };
}

function utcDate(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day));
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

// Traslada al lunes siguiente (Ley Emiliani); si ya cae en lunes, no se mueve.
function moveToMonday(date: Date): Date {
  const dow = date.getUTCDay();
  return addDays(date, (1 - dow + 7) % 7);
}

function fmt(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function getColombianHolidays(year: number): Set<string> {
  const set = new Set<string>();
  const add = (d: Date) => set.add(fmt(d));

  // Fijos, no se trasladan.
  add(utcDate(year, 1, 1)); // Año Nuevo
  add(utcDate(year, 5, 1)); // Día del Trabajo
  add(utcDate(year, 7, 20)); // Día de la Independencia
  add(utcDate(year, 8, 7)); // Batalla de Boyacá
  add(utcDate(year, 12, 8)); // Inmaculada Concepción
  add(utcDate(year, 12, 25)); // Navidad

  // Se trasladan al lunes siguiente.
  add(moveToMonday(utcDate(year, 1, 6))); // Reyes Magos
  add(moveToMonday(utcDate(year, 3, 19))); // San José
  add(moveToMonday(utcDate(year, 6, 29))); // San Pedro y San Pablo
  add(moveToMonday(utcDate(year, 8, 15))); // Asunción de la Virgen
  add(moveToMonday(utcDate(year, 10, 12))); // Día de la Raza
  add(moveToMonday(utcDate(year, 11, 1))); // Todos los Santos
  add(moveToMonday(utcDate(year, 11, 11))); // Independencia de Cartagena

  // Dependen de la fecha de Pascua.
  const easter = easterSunday(year);
  const easterDate = utcDate(year, easter.month, easter.day);
  add(addDays(easterDate, -3)); // Jueves Santo
  add(addDays(easterDate, -2)); // Viernes Santo
  add(moveToMonday(addDays(easterDate, 39))); // Ascensión del Señor
  add(moveToMonday(addDays(easterDate, 60))); // Corpus Christi
  add(moveToMonday(addDays(easterDate, 68))); // Sagrado Corazón de Jesús

  return set;
}
