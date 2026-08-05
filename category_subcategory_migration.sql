-- Introduce a two-level taxonomy: "category" becomes the parent topic
-- (Sueño infantil / Alimentación / Regalo) and a new "subcategory" column
-- becomes an independent, cross-cutting label (Curso / Guía / Tarjeta de
-- regalo / Libro / Gratuitos). The two dimensions are combinable — e.g. a
-- product can be category="Sueño infantil" + subcategory="Curso".
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS subcategory TEXT;

ALTER TABLE public.products
DROP CONSTRAINT IF EXISTS products_subcategory_check;

ALTER TABLE public.products
ADD CONSTRAINT products_subcategory_check
  CHECK (subcategory IS NULL OR subcategory IN ('Curso', 'Guía', 'Tarjeta de regalo', 'Libro', 'Gratuitos'));

-- Backfill subcategory from the old flat category values.
UPDATE public.products SET subcategory = 'Curso' WHERE category = 'Cursos' AND subcategory IS NULL;
UPDATE public.products SET subcategory = 'Libro' WHERE category = 'Libros' AND subcategory IS NULL;
UPDATE public.products SET subcategory = 'Tarjeta de regalo' WHERE category = 'Tarjeta de regalo' AND subcategory IS NULL;
UPDATE public.products SET subcategory = 'Gratuitos' WHERE (category = 'Gratuitos' OR price = 0) AND subcategory IS NULL;

-- Those old category values are no longer valid parent topics, so reparent
-- affected rows to "Sueño infantil" as a safe default. Spot-check /alimentacion
-- afterwards and manually move any misclassified product to "Alimentación".
UPDATE public.products
SET category = 'Sueño infantil'
WHERE category NOT IN ('Sueño infantil', 'Alimentación', 'Regalo');
