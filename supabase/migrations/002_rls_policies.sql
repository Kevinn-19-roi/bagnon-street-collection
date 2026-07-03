-- ============================================================
-- BAGNON STREET COLLECTION — Row Level Security Policies
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- ─── HELPER FUNCTION: check if user is admin ────────────────

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── CATEGORIES — public read, admin write ──────────────────

CREATE POLICY "categories_public_read"
  ON categories FOR SELECT
  USING (active = TRUE OR is_admin());

CREATE POLICY "categories_admin_all"
  ON categories FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ─── COLLECTIONS — public read, admin write ─────────────────

CREATE POLICY "collections_public_read"
  ON collections FOR SELECT
  USING (active = TRUE OR is_admin());

CREATE POLICY "collections_admin_all"
  ON collections FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ─── PRODUCTS — public read active, admin all ───────────────

CREATE POLICY "products_public_read"
  ON products FOR SELECT
  USING (active = TRUE OR is_admin());

CREATE POLICY "products_admin_all"
  ON products FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ─── PRODUCT IMAGES — public read, admin write ──────────────

CREATE POLICY "product_images_public_read"
  ON product_images FOR SELECT USING (TRUE);

CREATE POLICY "product_images_admin_all"
  ON product_images FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ─── PRODUCT SIZES & COLORS — public read ───────────────────

CREATE POLICY "product_sizes_public_read"
  ON product_sizes FOR SELECT USING (TRUE);

CREATE POLICY "product_sizes_admin_all"
  ON product_sizes FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "product_colors_public_read"
  ON product_colors FOR SELECT USING (TRUE);

CREATE POLICY "product_colors_admin_all"
  ON product_colors FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ─── CUSTOMERS — admin only ──────────────────────────────────

CREATE POLICY "customers_admin_all"
  ON customers FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Allow insert for orders (anonymous customers)
CREATE POLICY "customers_insert_public"
  ON customers FOR INSERT
  WITH CHECK (TRUE);

-- ─── ORDERS — admin all, insert public ──────────────────────

CREATE POLICY "orders_admin_all"
  ON orders FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "orders_insert_public"
  ON orders FOR INSERT
  WITH CHECK (TRUE);

-- ─── ORDER ITEMS — admin all, insert public ─────────────────

CREATE POLICY "order_items_admin_all"
  ON order_items FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "order_items_insert_public"
  ON order_items FOR INSERT
  WITH CHECK (TRUE);

-- ─── ADMINS — self read, super_admin all ────────────────────

CREATE POLICY "admins_self_read"
  ON admins FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "admins_super_admin_all"
  ON admins FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- ─── SITE SETTINGS — public read, admin write ───────────────

CREATE POLICY "settings_public_read"
  ON site_settings FOR SELECT USING (TRUE);

CREATE POLICY "settings_admin_write"
  ON site_settings FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

