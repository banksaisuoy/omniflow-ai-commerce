-- Drop the old function to avoid ambiguity
DROP FUNCTION IF EXISTS public.create_order(jsonb, text, text, jsonb, text, text, text);
DROP FUNCTION IF EXISTS public.create_order(jsonb, text, text, jsonb, text, text);

CREATE OR REPLACE FUNCTION public.create_order(
  _items jsonb,
  _customer_name text,
  _customer_email text,
  _shipping_address jsonb,
  _payment_method text,
  _coupon_code text DEFAULT NULL,
  _notes text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_subtotal numeric := 0;
  v_discount numeric := 0;
  v_shipping numeric := 0;
  v_total numeric := 0;
  v_order_id uuid := gen_random_uuid();
  v_order_number text;
  v_coupon public.coupons%ROWTYPE;
  v_coupon_code text := NULL;
  item jsonb;
  v_product public.products%ROWTYPE;
  v_qty int;
BEGIN
  IF _items IS NULL OR jsonb_typeof(_items) <> 'array' OR jsonb_array_length(_items) = 0 THEN
    RAISE EXCEPTION 'empty_cart';
  END IF;

  IF _customer_name IS NULL OR length(trim(_customer_name)) < 2 THEN
    RAISE EXCEPTION 'invalid_customer_name';
  END IF;
  IF _customer_email IS NULL OR _customer_email !~ '^[^@]+@[^@]+\.[^@]+$' THEN
    RAISE EXCEPTION 'invalid_customer_email';
  END IF;
  IF _payment_method NOT IN ('cod', 'promptpay') THEN
    RAISE EXCEPTION 'invalid_payment_method';
  END IF;

  FOR item IN SELECT * FROM jsonb_array_elements(_items) LOOP
    v_qty := GREATEST(COALESCE((item->>'quantity')::int, 1), 1);
    SELECT * INTO v_product FROM public.products
     WHERE id = (item->>'product_id')::uuid;
    IF NOT FOUND OR v_product.status <> 'active' THEN
      RAISE EXCEPTION 'invalid_product';
    END IF;
    v_subtotal := v_subtotal + (v_product.price * v_qty);
  END LOOP;

  IF _coupon_code IS NOT NULL AND length(trim(_coupon_code)) > 0 THEN
    SELECT * INTO v_coupon FROM public.coupons
      WHERE code = upper(trim(_coupon_code)) AND active = true
      FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'invalid_coupon'; END IF;
    IF v_coupon.expires_at IS NOT NULL AND v_coupon.expires_at < now() THEN
      RAISE EXCEPTION 'coupon_expired';
    END IF;
    IF v_coupon.max_uses IS NOT NULL AND v_coupon.used_count >= v_coupon.max_uses THEN
      RAISE EXCEPTION 'coupon_exhausted';
    END IF;
    IF v_subtotal < COALESCE(v_coupon.min_order, 0) THEN
      RAISE EXCEPTION 'coupon_min_order';
    END IF;
    IF v_coupon.discount_type = 'percent' THEN
      v_discount := round(v_subtotal * v_coupon.discount_value / 100, 2);
    ELSE
      v_discount := LEAST(v_coupon.discount_value, v_subtotal);
    END IF;
    UPDATE public.coupons SET used_count = used_count + 1 WHERE id = v_coupon.id;
    v_coupon_code := v_coupon.code;
  END IF;

  IF v_subtotal >= 500 THEN
    v_shipping := 0;
  ELSE
    v_shipping := 50;
  END IF;

  v_total := GREATEST(v_subtotal - v_discount, 0) + v_shipping;
  v_order_number := public.generate_order_number();

  INSERT INTO public.orders(id, order_number, customer_id, customer_name, customer_email,
    subtotal, discount_amount, shipping_amount, total, status, payment_status, shipping_address, metadata, notes)
  VALUES (v_order_id, v_order_number, v_uid, _customer_name, _customer_email,
    v_subtotal, v_discount, v_shipping, v_total, 'pending',
    CASE WHEN _payment_method = 'promptpay' THEN 'awaiting_payment' ELSE 'pending' END,
    _shipping_address,
    jsonb_build_object('payment_method', _payment_method, 'coupon_code', v_coupon_code),
    _notes);

  FOR item IN SELECT * FROM jsonb_array_elements(_items) LOOP
    v_qty := GREATEST(COALESCE((item->>'quantity')::int, 1), 1);
    SELECT * INTO v_product FROM public.products
     WHERE id = (item->>'product_id')::uuid;
    INSERT INTO public.order_items(order_id, product_id, product_name, product_image,
      quantity, unit_price, total_price)
    VALUES (v_order_id, v_product.id, v_product.name, v_product.thumbnail_url,
      v_qty, v_product.price, v_product.price * v_qty);
  END LOOP;

  RETURN jsonb_build_object('id', v_order_id, 'order_number', v_order_number,
    'subtotal', v_subtotal, 'discount', v_discount, 'shipping', v_shipping, 'total', v_total);
END; $$;
REVOKE ALL ON FUNCTION public.create_order(jsonb, text, text, jsonb, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_order(jsonb, text, text, jsonb, text, text, text) TO anon, authenticated;
