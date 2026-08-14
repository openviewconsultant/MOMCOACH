export function formatCOP(value: number): string {
  return value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
}

// Node (SSR) and browser (client) ICU builds can render "a. m./p. m." with
// different whitespace characters (narrow no-break space vs. non-breaking
// space) around otherwise identical text — normalize both to a plain space
// so server-rendered and client-rendered output match during hydration.
export function formatDateTimeCO(iso: string, options?: Intl.DateTimeFormatOptions): string {
  return new Date(iso).toLocaleString('es-CO', options).replace(/[\xa0 ]/g, ' ');
}
