-- ============================================================
-- BAGNON STREET COLLECTION — Storage Buckets
-- ============================================================

-- Products bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'products',
  'products',
  TRUE,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
);

-- Categories bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'categories',
  'categories',
  TRUE,
  3145728, -- 3MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Banners bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'banners',
  'banners',
  TRUE,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Brand bucket (logo, favicon)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'brand',
  'brand',
  TRUE,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/x-icon', 'image/svg+xml']
);

-- ─── STORAGE POLICIES ───────────────────────────────────────

-- Products: public read
CREATE POLICY "products_storage_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'products');

-- Products: admin upload
CREATE POLICY "products_storage_admin_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'products' AND
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

-- Products: admin delete
CREATE POLICY "products_storage_admin_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'products' AND
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

-- Categories: public read
CREATE POLICY "categories_storage_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'categories');

-- Categories: admin upload
CREATE POLICY "categories_storage_admin_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'categories' AND
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

-- Banners: public read
CREATE POLICY "banners_storage_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'banners');

-- Banners: admin upload
CREATE POLICY "banners_storage_admin_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'banners' AND
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

-- Brand: public read
CREATE POLICY "brand_storage_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'brand');

-- Brand: super_admin only upload
CREATE POLICY "brand_storage_superadmin_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'brand' AND
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid() AND role = 'super_admin')
  );

