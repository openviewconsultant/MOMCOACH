-- SQL para dar soporte a dos pasarelas de pago por producto: Mercado Pago (checkout propio) o Hotmart (link externo)
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS payment_provider TEXT NOT NULL DEFAULT 'mercadopago',
ADD COLUMN IF NOT EXISTS hotmart_url TEXT;

ALTER TABLE public.products
DROP CONSTRAINT IF EXISTS products_payment_provider_check;

ALTER TABLE public.products
ADD CONSTRAINT products_payment_provider_check CHECK (payment_provider IN ('mercadopago', 'hotmart'));
