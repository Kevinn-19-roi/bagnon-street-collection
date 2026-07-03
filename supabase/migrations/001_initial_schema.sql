-- ============================================================
-- BAGNON STREET COLLECTION — Initial Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── ENUMS ──────────────────────────────────────────────────

CREATE TYPE admin_role AS ENUM ('super_admin', 'admin', 'editor');

CREATE TYPE order_status AS ENUM (
  'pending',
  'confirmed',
  'preparing',
  'shipped',
  'delivered',
  'cancelled'
);

CREATE TYPE payment_status AS ENUM ('unpaid', 'paid', 'failed', 'refunded');

CREATE TYPE payment_method AS ENUM ('wave', 'orange_money', 'cash', 'bank_transfer');

-- ─── ADMINS ─────────────────────────────────────────────────

CREATE TABLE admins (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  fullname    TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  role        admin_role NOT NULL DEFAULT 'editor',
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── CATEGORIES ─────────────────────────────────────────────

CREATE TABLE categories (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  image         TEXT,
  description   TEXT,
  active        BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── COLLECTIONS ────────────────────────────────────────────

CREATE TABLE collections (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  image       TEXT,
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── PRODUCTS ───────────────────────────────────────────────

CREATE TABLE products (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name               TEXT NOT NULL,
  slug               TEXT NOT NULL UNIQUE,
  sku                TEXT NOT NULL UNIQUE,
  description        TEXT,
  short_description  TEXT,
  category_id        UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  collection_id      UUID REFERENCES collections(id) ON DELETE SET NULL,
  price              DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  old_price          DECIMAL(10,2) CHECK (old_price >= 0),
  stock              INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  featured           BOOLEAN NOT NULL DEFAULT FALSE,
  new_arrival        BOOLEAN NOT NULL DEFAULT FALSE,
  on_sale            BOOLEAN NOT NULL DEFAULT FALSE,
  active             BOOLEAN NOT NULL DEFAULT TRUE,
  weight             DECIMAL(6,2),
  material           TEXT,
  care_instructions  TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── PRODUCT IMAGES ─────────────────────────────────────────

CREATE TABLE product_images (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id    UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url     TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── PRODUCT SIZES ──────────────────────────────────────────

CREATE TABLE product_sizes (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size       TEXT NOT NULL,
  stock      INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  UNIQUE(product_id, size)
);

-- ─── PRODUCT COLORS ─────────────────────────────────────────

CREATE TABLE product_colors (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  color_name  TEXT NOT NULL,
  color_hex   TEXT NOT NULL,
  stock       INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  UNIQUE(product_id, color_name)
);

-- ─── CUSTOMERS ──────────────────────────────────────────────

CREATE TABLE customers (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fullname   TEXT NOT NULL,
  phone      TEXT NOT NULL,
  email      TEXT,
  address    TEXT,
  city       TEXT,
  country    TEXT NOT NULL DEFAULT 'Côte d''Ivoire',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── ORDERS ─────────────────────────────────────────────────

CREATE TABLE orders (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id    UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  order_number   TEXT NOT NULL UNIQUE,
  subtotal       DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
  shipping_cost  DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (shipping_cost >= 0),
  total          DECIMAL(10,2) NOT NULL CHECK (total >= 0),
  payment_method payment_method NOT NULL DEFAULT 'wave',
  payment_status payment_status NOT NULL DEFAULT 'unpaid',
  order_status   order_status NOT NULL DEFAULT 'pending',
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── ORDER ITEMS ────────────────────────────────────────────

CREATE TABLE order_items (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id       UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id     UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity       INT NOT NULL CHECK (quantity > 0),
  selected_size  TEXT,
  selected_color TEXT,
  price          DECIMAL(10,2) NOT NULL CHECK (price >= 0)
);

-- ─── SITE SETTINGS ──────────────────────────────────────────

CREATE TABLE site_settings (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  whatsapp          TEXT,
  facebook          TEXT,
  instagram         TEXT,
  tiktok            TEXT,
  address           TEXT,
  email             TEXT,
  phone             TEXT,
  shipping_cost     DECIMAL(10,2) NOT NULL DEFAULT 2000,
  free_shipping_from DECIMAL(10,2) NOT NULL DEFAULT 25000,
  logo_url          TEXT,
  favicon_url       TEXT,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default settings row (singleton pattern)
INSERT INTO site_settings (shipping_cost, free_shipping_from)
VALUES (2000, 25000);

-- ─── INDEXES ────────────────────────────────────────────────

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_collection ON products(collection_id);
CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_products_new_arrival ON products(new_arrival);
CREATE INDEX idx_product_images_product ON product_images(product_id);
CREATE INDEX idx_product_sizes_product ON product_sizes(product_id);
CREATE INDEX idx_product_colors_product ON product_colors(product_id);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_payment ON orders(payment_status);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ─── AUTO UPDATE updated_at ─────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_admins_updated_at
  BEFORE UPDATE ON admins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── AUTO-GENERATE ORDER NUMBER ─────────────────────────────

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number = 'BSC-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL OR NEW.order_number = '')
  EXECUTE FUNCTION generate_order_number();

-- ─── SEED: Categories ───────────────────────────────────────

INSERT INTO categories (name, slug, display_order) VALUES
  ('T-shirts', 'tshirts', 1),
  ('Hoodies', 'hoodies', 2),
  ('Pantalons', 'pantalons', 3),
  ('Sacs', 'sacs', 4),
  ('Casquettes', 'casquettes', 5),
  ('Accessoires', 'accessoires', 6);

-- ─── SEED: Collections ──────────────────────────────────────

INSERT INTO collections (name, slug) VALUES
  ('Essentials', 'essentials'),
  ('Summer 2026', 'summer-2026'),
  ('Winter Collection', 'winter-collection'),
  ('Limited Edition', 'limited-edition');

