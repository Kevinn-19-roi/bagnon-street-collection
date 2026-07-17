-- Sprint 10.4 - Ensure video posters are truly optional in production.
-- Non-destructive and idempotent: existing rows are preserved.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'video_items'
      AND column_name = 'poster_url'
  ) THEN
    ALTER TABLE public.video_items
      ALTER COLUMN poster_url DROP NOT NULL;
  END IF;
END $$;
