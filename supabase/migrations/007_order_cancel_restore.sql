-- Sprint 9.6 - Order cancellation with idempotent stock restoration.
-- Non-destructive migration. It preserves existing orders and data.

ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id);

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS stock_restored_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancelled_by UUID REFERENCES admins(id);

CREATE INDEX IF NOT EXISTS idx_customers_auth_user_id
  ON customers(auth_user_id);

CREATE INDEX IF NOT EXISTS idx_orders_stock_restored_at
  ON orders(stock_restored_at);

CREATE OR REPLACE FUNCTION cancel_order_with_stock_restore(
  p_order_id UUID,
  p_admin_id UUID
)
RETURNS orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order orders%ROWTYPE;
  v_item RECORD;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM admins WHERE id = p_admin_id) THEN
    RAISE EXCEPTION 'admin_required';
  END IF;

  SELECT *
    INTO v_order
    FROM orders
   WHERE id = p_order_id
   FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'order_not_found';
  END IF;

  IF v_order.order_status = 'delivered' THEN
    RAISE EXCEPTION 'delivered_order_cannot_be_cancelled';
  END IF;

  IF v_order.order_status = 'cancelled' THEN
    RETURN v_order;
  END IF;

  IF v_order.stock_decremented_at IS NOT NULL AND v_order.stock_restored_at IS NULL THEN
    FOR v_item IN
      SELECT product_id, selected_size, selected_color, quantity
        FROM order_items
       WHERE order_id = p_order_id
       FOR UPDATE
    LOOP
      UPDATE products
         SET stock = stock + v_item.quantity
       WHERE id = v_item.product_id;

      IF v_item.selected_size IS NOT NULL THEN
        UPDATE product_sizes
           SET stock = stock + v_item.quantity
         WHERE product_id = v_item.product_id
           AND size = v_item.selected_size;
      END IF;

      IF v_item.selected_color IS NOT NULL THEN
        UPDATE product_colors
           SET stock = stock + v_item.quantity
         WHERE product_id = v_item.product_id
           AND color_name = v_item.selected_color;
      END IF;
    END LOOP;

    UPDATE orders
       SET order_status = 'cancelled',
           cancelled_at = NOW(),
           cancelled_by = p_admin_id,
           stock_restored_at = NOW()
     WHERE id = p_order_id
     RETURNING * INTO v_order;
  ELSE
    UPDATE orders
       SET order_status = 'cancelled',
           cancelled_at = NOW(),
           cancelled_by = p_admin_id
     WHERE id = p_order_id
     RETURNING * INTO v_order;
  END IF;

  RETURN v_order;
END;
$$;

REVOKE ALL ON FUNCTION cancel_order_with_stock_restore(UUID, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION cancel_order_with_stock_restore(UUID, UUID) FROM anon;
REVOKE ALL ON FUNCTION cancel_order_with_stock_restore(UUID, UUID) FROM authenticated;
GRANT EXECUTE ON FUNCTION cancel_order_with_stock_restore(UUID, UUID) TO service_role;
