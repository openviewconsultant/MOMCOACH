export function formatUSD(value: number): string {
  return `USD $${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
}

// Node (SSR) and browser (client) ICU builds can render "a. m./p. m." with
// different whitespace characters (narrow no-break space vs. non-breaking
// space) around otherwise identical text — normalize both to a plain space
// so server-rendered and client-rendered output match during hydration.
export function formatDateTimeCO(iso: string, options?: Intl.DateTimeFormatOptions): string {
  return new Date(iso).toLocaleString('es-CO', options).replace(/[\xa0 ]/g, ' ');
}
