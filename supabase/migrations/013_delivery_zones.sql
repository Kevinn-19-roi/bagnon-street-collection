-- Delivery zones and order delivery snapshots.
-- Non-destructive: creates a dedicated editable grid, keeps old shipping_cost for compatibility.

CREATE TABLE IF NOT EXISTS delivery_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  price INTEGER NOT NULL CHECK (price >= 0),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS outside_abidjan_shipping_cost INTEGER NOT NULL DEFAULT 3500;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS delivery_type TEXT NOT NULL DEFAULT 'legacy',
  ADD COLUMN IF NOT EXISTS delivery_zone_id UUID REFERENCES delivery_zones(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS delivery_label TEXT,
  ADD COLUMN IF NOT EXISTS delivery_destination TEXT;

CREATE INDEX IF NOT EXISTS idx_delivery_zones_active_order
  ON delivery_zones(active, display_order);

CREATE INDEX IF NOT EXISTS idx_orders_delivery_zone_id
  ON orders(delivery_zone_id);

INSERT INTO delivery_zones (name, slug, price, display_order, active)
VALUES
  ('Cocody', 'cocody', 2000, 10, TRUE),
  ('Treichville', 'treichville', 2000, 20, TRUE),
  ('Marcory', 'marcory', 2000, 30, TRUE),
  ('Koumassi', 'koumassi', 2000, 40, TRUE),
  ('Plateau', 'plateau', 2000, 50, TRUE),
  ('Adjamé', 'adjame', 2000, 60, TRUE),
  ('Yopougon 1er pont', 'yopougon-1er-pont', 2000, 70, TRUE),
  ('Yopougon 2e pont', 'yopougon-2e-pont', 2000, 80, TRUE),
  ('Bingerville', 'bingerville', 2000, 90, TRUE),
  ('Abobo', 'abobo', 3000, 100, TRUE),
  ('Yopougon 3e pont', 'yopougon-3e-pont', 3000, 110, TRUE),
  ('Yopougon Extension', 'yopougon-extension', 3000, 120, TRUE),
  ('Bingerville Extension', 'bingerville-extension', 3000, 130, TRUE),
  ('Anyama', 'anyama', 4000, 140, TRUE),
  ('Grand-Bassam', 'grand-bassam', 4000, 150, TRUE)
ON CONFLICT (slug) DO NOTHING;
