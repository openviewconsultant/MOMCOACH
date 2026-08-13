-- Tabla de citas/reservas (llamadas gratuitas y asesorías pagas), que
-- reemplaza a Cal.com. Las citas gratuitas quedan "confirmed" de una vez;
-- las pagas nacen "pending" y pasan a "confirmed" cuando Mercado Pago
-- aprueba el pago (ver el webhook en /api/mercadopago/webhook).
--
-- Ejecutar en Supabase (SQL Editor).

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  buyer_name text NOT NULL,
  buyer_email text NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  calendar_event_id text,
  meet_link text,
  notified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS bookings_start_time_idx ON bookings (start_time);
CREATE INDEX IF NOT EXISTS bookings_order_id_idx ON bookings (order_id);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- El backend usa la service role key (bypassa RLS). Esta política solo
-- habilita lectura para usuarios administradores autenticados desde el panel.
DROP POLICY IF EXISTS "Admins pueden leer bookings" ON bookings;
CREATE POLICY "Admins pueden leer bookings" ON bookings
  FOR SELECT USING (auth.role() = 'authenticated');
