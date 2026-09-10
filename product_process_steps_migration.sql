-- Pasos del proceso de un producto/servicio (ej. "Plan de Sueño Infantil"),
-- se muestran como una línea de tiempo numerada en la página del producto.
-- Un arreglo JSON de textos, un paso por elemento.
--
-- Ejecutar en Supabase (SQL Editor) antes de desplegar.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS process_steps jsonb;
