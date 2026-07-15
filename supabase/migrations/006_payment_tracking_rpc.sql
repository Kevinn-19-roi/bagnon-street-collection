-- ============================================================
-- BAGNON STREET COLLECTION - Manual payment tracking and stock RPC
-- ============================================================

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS provider_transaction_id TEXT,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_confirmed_by UUID REFERENCES admins(id),
  ADD COLUMN IF NOT EXISTS payment_confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS stock_decremented_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_provider_transaction_id
  ON orders(provider_transaction_id)
  WHERE provider_transaction_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_paid_at
  ON orders(paid_at);

CREATE INDEX IF NOT EXISTS idx_orders_stock_decremented_at
  ON orders(stock_decremented_at);

CREATE OR REPLACE FUNCTION confirm_manual_wave_payment(
  p_order_id UUID,
  p_admin_id UUID,
  p_provider_transaction_id TEXT DEFAULT NULL
)
RETURNS orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order orders%ROWTYPE;
  v_item RECORD;
  v_provider_transaction_id TEXT;
BEGIN
  SELECT *
    INTO v_order
    FROM orders
   WHERE id = p_order_id
   FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Commande introuvable.';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM admins WHERE id = p_admin_id) THEN
    RAISE EXCEPTION 'Administrateur invalide.';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = p_order_id) THEN
    RAISE EXCEPTION 'La commande ne contient aucun article.';
  END IF;

  IF v_order.payment_method <> 'wave' THEN
    RAISE EXCEPTION 'Cette confirmation manuelle est reservee aux paiements Wave.';
  END IF;

  IF v_order.payment_status = 'paid' OR v_order.stock_decremented_at IS NOT NULL THEN
    RAISE EXCEPTION 'Cette commande a deja ete confirmee.';
  END IF;

  IF v_order.order_status = 'cancelled' THEN
    RAISE EXCEPTION 'Une commande annulee ne peut pas etre confirmee.';
  END IF;

  v_provider_transaction_id := NULLIF(BTRIM(p_provider_transaction_id), '');

  IF v_provider_transaction_id IS NOT NULL AND EXISTS (
    SELECT 1
      FROM orders
     WHERE provider_transaction_id = v_provider_transaction_id
       AND id <> p_order_id
  ) THEN
    RAISE EXCEPTION 'Cette reference de transaction est deja utilisee.';
  END IF;

  FOR v_item IN
    SELECT *
      FROM order_items
     WHERE order_id = p_order_id
     ORDER BY id
  LOOP
    PERFORM 1
      FROM products
     WHERE id = v_item.product_id
       AND stock >= v_item.quantity
     FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Stock insuffisant pour un produit de la commande.';
    END IF;

    IF v_item.selected_size IS NOT NULL THEN
      PERFORM 1
        FROM product_sizes
       WHERE product_id = v_item.product_id
         AND size = v_item.selected_size
         AND stock >= v_item.quantity
       FOR UPDATE;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Stock insuffisant pour une taille de la commande.';
      END IF;
    END IF;

    IF v_item.selected_color IS NOT NULL THEN
      PERFORM 1
        FROM product_colors
       WHERE product_id = v_item.product_id
         AND color_name = v_item.selected_color
         AND stock >= v_item.quantity
       FOR UPDATE;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Stock insuffisant pour une couleur de la commande.';
      END IF;
    END IF;
  END LOOP;

  FOR v_item IN
    SELECT *
      FROM order_items
     WHERE order_id = p_order_id
     ORDER BY id
  LOOP
    UPDATE products
       SET stock = stock - v_item.quantity
     WHERE id = v_item.product_id;

    IF v_item.selected_size IS NOT NULL THEN
      UPDATE product_sizes
         SET stock = stock - v_item.quantity
       WHERE product_id = v_item.product_id
         AND size = v_item.selected_size;
    END IF;

    IF v_item.selected_color IS NOT NULL THEN
      UPDATE product_colors
         SET stock = stock - v_item.quantity
       WHERE product_id = v_item.product_id
         AND color_name = v_item.selected_color;
    END IF;
  END LOOP;

  UPDATE orders
     SET payment_status = 'paid',
         order_status = 'confirmed',
         provider_transaction_id = v_provider_transaction_id,
         paid_at = NOW(),
         payment_confirmed_by = p_admin_id,
         payment_confirmed_at = NOW(),
         stock_decremented_at = NOW()
   WHERE id = p_order_id
   RETURNING * INTO v_order;

  RETURN v_order;
END;
$$;

REVOKE ALL ON FUNCTION confirm_manual_wave_payment(UUID, UUID, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION confirm_manual_wave_payment(UUID, UUID, TEXT) FROM anon;
REVOKE ALL ON FUNCTION confirm_manual_wave_payment(UUID, UUID, TEXT) FROM authenticated;
GRANT EXECUTE ON FUNCTION confirm_manual_wave_payment(UUID, UUID, TEXT) TO service_role;
