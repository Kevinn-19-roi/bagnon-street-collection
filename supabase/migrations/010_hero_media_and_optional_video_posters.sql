-- Sprint 10.1 - Hero media controls and optional video posters.
-- Non-destructive migration. It keeps existing values and only adds optional fields.

ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS hero_video_url TEXT,
  ADD COLUMN IF NOT EXISTS hero_media_type TEXT NOT NULL DEFAULT 'image',
  ADD COLUMN IF NOT EXISTS hero_media_position TEXT NOT NULL DEFAULT 'center',
  ADD COLUMN IF NOT EXISTS hero_overlay_opacity NUMERIC NOT NULL DEFAULT 0.42,
  ADD COLUMN IF NOT EXISTS brand_quote TEXT,
  ADD COLUMN IF NOT EXISTS brand_quote_author TEXT;

ALTER TABLE video_items
  ALTER COLUMN poster_url DROP NOT NULL;

