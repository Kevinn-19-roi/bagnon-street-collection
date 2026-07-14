-- Home hero settings, added without changing existing data.
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS hero_image_url TEXT,
  ADD COLUMN IF NOT EXISTS hero_eyebrow TEXT,
  ADD COLUMN IF NOT EXISTS hero_title TEXT,
  ADD COLUMN IF NOT EXISTS hero_title_accent TEXT,
  ADD COLUMN IF NOT EXISTS hero_description TEXT,
  ADD COLUMN IF NOT EXISTS hero_button_text TEXT,
  ADD COLUMN IF NOT EXISTS hero_button_link TEXT;
