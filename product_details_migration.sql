-- Adds structured "details" section (heading + items) and an optional price note
-- to products, used by the service detail pages (/tienda/[id]) to mirror the
-- structure of the legacy WordPress product pages.

alter table products add column if not exists details jsonb;
alter table products add column if not exists price_note text;

-- details shape: { "heading": "Temas:", "items": ["...", "..."] }
