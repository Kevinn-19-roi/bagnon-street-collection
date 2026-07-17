-- Sprint 10 - Admin-managed home gallery and videos.
-- Non-destructive migration. It creates two optional content tables.

CREATE TABLE IF NOT EXISTS gallery_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT NOT NULL,
  caption TEXT,
  display_order INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS video_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  caption TEXT,
  video_url TEXT NOT NULL,
  poster_url TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gallery_items_active_order
  ON gallery_items(active, display_order);

CREATE INDEX IF NOT EXISTS idx_video_items_active_order
  ON video_items(active, display_order);

DROP TRIGGER IF EXISTS trigger_gallery_items_updated_at ON gallery_items;
CREATE TRIGGER trigger_gallery_items_updated_at
  BEFORE UPDATE ON gallery_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_video_items_updated_at ON video_items;
CREATE TRIGGER trigger_video_items_updated_at
  BEFORE UPDATE ON video_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "gallery_items_public_read" ON gallery_items;
CREATE POLICY "gallery_items_public_read"
  ON gallery_items FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "gallery_items_admin_write" ON gallery_items;
CREATE POLICY "gallery_items_admin_write"
  ON gallery_items FOR ALL
  USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

DROP POLICY IF EXISTS "video_items_public_read" ON video_items;
CREATE POLICY "video_items_public_read"
  ON video_items FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "video_items_admin_write" ON video_items;
CREATE POLICY "video_items_admin_write"
  ON video_items FOR ALL
  USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));
