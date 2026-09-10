-- Sección "Proceso" en la página del producto/servicio.
--   process_image_url : una imagen (infografía) que se muestra tal cual.
--   process_steps     : alternativa en texto — un arreglo JSON, un paso por
--                       elemento, se pinta como línea de tiempo numerada.
-- Si hay imagen, se muestra la imagen; si no, los pasos.
--
-- Ejecutar en Supabase (SQL Editor) antes de desplegar.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS process_steps jsonb,
  ADD COLUMN IF NOT EXISTS process_image_url text;
