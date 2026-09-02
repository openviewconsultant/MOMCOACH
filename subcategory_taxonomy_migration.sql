-- Expands the products.subcategory taxonomy so the /tienda type filter works
-- for every product (previously only 'Gratuitos' and 'Tarjeta de regalo' were
-- assigned, so 'Curso' / 'Guía' / 'Libro' returned nothing).

alter table products drop constraint if exists products_subcategory_check;
alter table products add constraint products_subcategory_check
  check (subcategory is null or subcategory = any (array[
    'Curso'::text, 'Guía'::text, 'Recetario'::text, 'Libro'::text,
    'Asesoría'::text, 'Tarjeta de regalo'::text, 'Gratuitos'::text
  ]));

-- Backfill (run once against the live data):
--   Guía      -> todas las "Guía: …", Experiencias Sensoriales en Casa, Selectividad Alimentaria
--   Recetario -> los "Recetario …"
--   Libro     -> Ebook: Newborn Sleep Shaping Guide
--   Curso     -> Curso Inicio de Alimentación Complementaria, Programa Recién Nacidos (0 a 4 meses)
--   Asesoría  -> Plan de Sueño Infantil, Llamada de Consulta (Sueño y Alimentación), Asesoría Picky Eaters
