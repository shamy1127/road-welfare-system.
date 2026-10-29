ALTER TABLE public.reports
ADD COLUMN IF NOT EXISTS after_review_image_urls text[] NOT NULL DEFAULT '{}';
