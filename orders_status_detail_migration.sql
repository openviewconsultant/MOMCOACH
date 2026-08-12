-- Agrega una columna para guardar el detalle/razón del estado del pago que
-- devuelve Mercado Pago (ej. "cc_rejected_insufficient_amount",
-- "pending_contingency", "cancelled", etc.), para poder mostrarla en el
-- panel de administración de Pedidos cuando un pago falla o queda pendiente.
--
-- Ejecutar en Supabase (SQL Editor) antes de desplegar el webhook actualizado.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS status_detail text;
