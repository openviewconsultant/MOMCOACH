import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Cliente con la service role key: ignora RLS. Solo debe usarse en rutas de
 * servidor de cara al público (crear-preferencia, webhook, descarga gratuita)
 * donde el comprador no está autenticado con Supabase Auth.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY');
  }
  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
