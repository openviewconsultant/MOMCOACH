-- SQL para actualizar la tabla public.products y dar soporte a servicios y campos adicionales
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS product_type TEXT DEFAULT 'digital',
ADD COLUMN IF NOT EXISTS subtitle TEXT,
ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS whatsapp_text TEXT,
ADD COLUMN IF NOT EXISTS cal_link TEXT;
