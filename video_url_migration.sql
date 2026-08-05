-- Video URL for the product detail page (YouTube or Vimeo link), matching the
-- legacy WordPress product page which could embed a promo/explainer video.
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS video_url TEXT;
