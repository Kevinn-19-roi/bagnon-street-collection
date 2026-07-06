-- ============================================================
-- BAGNON STREET COLLECTION — Seed Real Products
-- ============================================================
-- Run this in Supabase SQL Editor to add the catalog products

-- Get category IDs first (check what exists)
DO $$
DECLARE
  cat_tshirts UUID;
  cat_hoodies UUID;
  cat_sacs UUID;
  cat_bas UUID;
  col_essentials UUID;
  p1 UUID;
  p2 UUID;
  p3 UUID;
  p4 UUID;
  p5 UUID;
  p6 UUID;
BEGIN

  -- Get category IDs
  SELECT id INTO cat_tshirts FROM categories WHERE slug = 'tshirts' LIMIT 1;
  SELECT id INTO cat_hoodies FROM categories WHERE slug = 'hoodies' LIMIT 1;
  SELECT id INTO cat_sacs FROM categories WHERE slug = 'sacs' LIMIT 1;
  SELECT id INTO cat_bas FROM categories WHERE slug = 'pantalons' LIMIT 1;
  SELECT id INTO col_essentials FROM collections WHERE slug = 'essentials' LIMIT 1;

  -- Product 1: Hoodie BSC Kaki
  INSERT INTO products (name, slug, sku, description, short_description, category_id, collection_id, price, old_price, stock, featured, new_arrival, on_sale, active, material)
  VALUES (
    'Hoodie BSC — Kaki',
    'hoodie-bsc-kaki',
    'HOO-BSC-1001',
    'Hoodie oversize coton lourd 380g. Patch brodé logo globe BSC orange sur la poitrine. Cordon de serrage crème, poche kangourou.',
    'Hoodie oversize avec patch brodé BSC',
    cat_hoodies, col_essentials, 22000, 27000, 50, TRUE, FALSE, TRUE, TRUE, '100% Coton 380g'
  ) RETURNING id INTO p1;

  -- Product 2: Tee Globe Noir
  INSERT INTO products (name, slug, sku, description, short_description, category_id, collection_id, price, old_price, stock, featured, new_arrival, on_sale, active, material)
  VALUES (
    'Tee BSC Globe — Noir',
    'tee-globe-noir',
    'TEE-BSC-1002',
    'T-shirt oversize coton 220g. Logo globe BSC brodé poitrine + imprimé XL au dos. Col rond, coupe boxy.',
    'T-shirt oversize logo globe BSC',
    cat_tshirts, col_essentials, 9500, 12000, 80, TRUE, FALSE, TRUE, TRUE, '100% Coton 220g'
  ) RETURNING id INTO p2;

  -- Product 3: Jogger Camo Noir
  INSERT INTO products (name, slug, sku, description, short_description, category_id, collection_id, price, old_price, stock, featured, new_arrival, on_sale, active, material)
  VALUES (
    'Jogger BSC — Camo Noir',
    'jogger-bsc-camo-noir',
    'JOG-BSC-1003',
    'Jogger cargo tie-dye camouflage. Inscription Bagnon Street Collection en arc. Poches cargo latérales, taille élastique.',
    'Jogger cargo camouflage noir',
    cat_bas, NULL, 19000, 24000, 30, TRUE, FALSE, TRUE, TRUE, 'Polyester/Coton'
  ) RETURNING id INTO p3;

  -- Product 4: Sac Camo Vert
  INSERT INTO products (name, slug, sku, description, short_description, category_id, collection_id, price, old_price, stock, featured, new_arrival, on_sale, active, material)
  VALUES (
    'Sac à dos BSC — Camo Vert',
    'sac-bsc-camo-vert',
    'SAC-BSC-1004',
    'Sac à dos camouflage vert. Patch brodé circulaire BSC Collection. Poche avant, dos rembourrée, bretelles larges.',
    'Sac à dos camouflage avec patch BSC',
    cat_sacs, NULL, 14500, 18000, 25, TRUE, FALSE, TRUE, TRUE, 'Polyester 600D'
  ) RETURNING id INTO p4;

  -- Product 5: Tee Globe Blanc
  INSERT INTO products (name, slug, sku, description, short_description, category_id, collection_id, price, old_price, stock, featured, new_arrival, on_sale, active, material)
  VALUES (
    'Tee BSC Globe — Blanc',
    'tee-globe-blanc',
    'TEE-BSC-1005',
    'T-shirt blanc, logo globe imprimé dos format XL, version poitrine au recto. Edition classique BSC.',
    'T-shirt blanc avec logo globe BSC',
    cat_tshirts, col_essentials, 9500, 12000, 0, FALSE, FALSE, FALSE, TRUE, '100% Coton 220g'
  ) RETURNING id INTO p5;

  -- Product 6: Tee Seek Progress
  INSERT INTO products (name, slug, sku, description, short_description, category_id, collection_id, price, old_price, stock, featured, new_arrival, on_sale, active, material)
  VALUES (
    'Tee BSC — Seek Progress',
    'tee-bsc-seek-progress',
    'TEE-BSC-1006',
    'T-shirt noir avec print jaune fluo au dos : Seek Progress / Bagnon Street. Typographie old english.',
    'T-shirt "Seek Progress" jaune fluo',
    cat_tshirts, NULL, 9800, 12500, 40, FALSE, TRUE, FALSE, TRUE, '100% Coton 220g'
  ) RETURNING id INTO p6;

  -- Add sizes for hoodies
  INSERT INTO product_sizes (product_id, size, stock) VALUES
    (p1, 'S', 5), (p1, 'M', 15), (p1, 'L', 20), (p1, 'XL', 8), (p1, 'XXL', 2);

  -- Add sizes for tshirts
  INSERT INTO product_sizes (product_id, size, stock) VALUES
    (p2, 'S', 10), (p2, 'M', 25), (p2, 'L', 30), (p2, 'XL', 15);

  INSERT INTO product_sizes (product_id, size, stock) VALUES
    (p5, 'S', 0), (p5, 'M', 0), (p5, 'L', 0), (p5, 'XL', 0);

  INSERT INTO product_sizes (product_id, size, stock) VALUES
    (p6, 'S', 8), (p6, 'M', 18), (p6, 'L', 10), (p6, 'XL', 4);

  RAISE NOTICE 'Products seeded successfully!';
END $$;
