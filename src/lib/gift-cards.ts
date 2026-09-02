import type { GiftCardProgram } from './types';

export const GIFT_CARD_PROGRAM_LABEL: Record<GiftCardProgram, string> = {
  sueno: 'Programa de Sueño',
  alimentacion: 'Programa de Alimentación',
};

/** Categoría de producto (columna products.category) que puede pagar cada programa. */
export const GIFT_CARD_PROGRAM_CATEGORY: Record<GiftCardProgram, string> = {
  sueno: 'Sueño infantil',
  alimentacion: 'Alimentación',
};

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sin I, O, 0, 1

/** Genera un código tipo TMC-XXXX-XXXX (fácil de leer y teclear). */
export function generateGiftCardCode(): string {
  const block = () =>
    Array.from({ length: 4 }, () => CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]).join('');
  return `TMC-${block()}-${block()}`;
}

export function normalizeGiftCardCode(raw: string): string {
  return raw
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .replace(/^TMC/, '')
    .replace(/(.{4})(.{4}).*/, 'TMC-$1-$2');
}
