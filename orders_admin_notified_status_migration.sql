-- Guarda de qué estado de pago (approved / pending / rejected) ya se le
-- avisó por correo a Denisse, para no repetir el mismo aviso cada vez que
-- el cron o el panel vuelven a revisar una orden pendiente.
--
-- Ejecutar en Supabase (SQL Editor) antes de desplegar.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS admin_notified_status text;
