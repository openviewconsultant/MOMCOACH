import { createBrowserClient } from '@supabase/ssr';

/**
 * @param rememberSession Cuando es `false`, la cookie de sesión se crea sin
 * `maxAge` (cookie de sesión: se borra al cerrar el navegador). Por defecto
 * la sesión persiste (comportamiento normal de Supabase).
 */
export function createClient(options?: { rememberSession?: boolean }) {
  const rememberSession = options?.rememberSession ?? true;
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    rememberSession
      ? undefined
      : { cookieOptions: { maxAge: undefined }, isSingleton: false }
  );
}
