
-- 1) Products: hide cost_price + embedding from anon/authenticated (column-level grants)
REVOKE SELECT ON public.products FROM anon, authenticated;
GRANT SELECT (id, name, slug, description, description_html, price, compare_at_price,
              category, subcategory, brand, tags, images, thumbnail_url, sku, barcode,
              weight, weight_unit, status, is_featured, seo_title, seo_description,
              ai_generated_data, created_at, updated_at)
  ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;

-- Admin RPC to fetch full product (with cost_price) when needed
CREATE OR REPLACE FUNCTION public.admin_get_product(_id uuid)
RETURNS SETOF public.products
LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT * FROM public.products
   WHERE id = _id AND public.has_role(auth.uid(), 'admin');
$$;
REVOKE ALL ON FUNCTION public.admin_get_product(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_get_product(uuid) TO authenticated;

-- 2) Reviews: hide customer_email
REVOKE SELECT ON public.reviews FROM anon, authenticated;
GRANT SELECT (id, product_id, customer_id, customer_name, rating, title, content, status,
              moderation_reason, ai_sentiment, ai_auto_reply, ai_auto_reply_status,
              is_verified_purchase, helpful_count, created_at, updated_at)
  ON public.reviews TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;

-- 3) order_events: remove anon blanket read
DROP POLICY IF EXISTS "order_events public track" ON public.order_events;
REVOKE SELECT ON public.order_events FROM anon;

-- 4) Coupons: remove public browse, tighten grants
DROP POLICY IF EXISTS "coupons active viewable" ON public.coupons;
REVOKE SELECT ON public.coupons FROM anon, authenticated;
GRANT ALL ON public.coupons TO service_role;

-- Coupon validator (returns only the requested code's discount)
CREATE OR REPLACE FUNCTION public.validate_coupon(_code text, _subtotal numeric)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public AS $$
DECLARE v_c public.coupons%ROWTYPE; v_disc numeric;
BEGIN
  IF _code IS NULL OR length(trim(_code)) = 0 THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'empty');
  END IF;
  SELECT * INTO v_c FROM public.coupons
   WHERE code = upper(trim(_code)) AND active = true;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'not_found');
  END IF;
  IF v_c.expires_at IS NOT NULL AND v_c.expires_at < now() THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'expired');
  END IF;
  IF v_c.max_uses IS NOT NULL AND v_c.used_count >= v_c.max_uses THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'exhausted');
  END IF;
  IF _subtotal < COALESCE(v_c.min_order, 0) THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'min_order', 'min_order', v_c.min_order);
  END IF;
  IF v_c.discount_type = 'percent' THEN
    v_disc := round(_subtotal * v_c.discount_value / 100, 2);
  ELSE
    v_disc := LEAST(v_c.discount_value, _subtotal);
  END IF;
  RETURN jsonb_build_object('valid', true, 'code', v_c.code,
    'discount', v_disc, 'discount_type', v_c.discount_type,
    'discount_value', v_c.discount_value);
END; $$;
REVOKE ALL ON FUNCTION public.validate_coupon(text, numeric) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.validate_coupon(text, numeric) TO anon, authenticated;

-- 5) Atomic server-side order creation (prevents price tampering + enforces coupon usage)
CREATE OR REPLACE FUNCTION public.create_order(
  _items jsonb,
  _customer_name text,
  _customer_email text,
  _shipping_address jsonb,
  _payment_method text,
  _coupon_code text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_subtotal numeric := 0;
  v_discount numeric := 0;
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

  v_total := GREATEST(v_subtotal - v_discount, 0);
  v_order_number := public.generate_order_number();

  INSERT INTO public.orders(id, order_number, customer_id, customer_name, customer_email,
    subtotal, discount_amount, total, status, payment_status, shipping_address, metadata)
  VALUES (v_order_id, v_order_number, v_uid, _customer_name, _customer_email,
    v_subtotal, v_discount, v_total, 'pending',
    CASE WHEN _payment_method = 'promptpay' THEN 'awaiting_payment' ELSE 'pending' END,
    _shipping_address,
    jsonb_build_object('payment_method', _payment_method, 'coupon_code', v_coupon_code));

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
    'subtotal', v_subtotal, 'discount', v_discount, 'total', v_total);
END; $$;
REVOKE ALL ON FUNCTION public.create_order(jsonb, text, text, jsonb, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_order(jsonb, text, text, jsonb, text, text) TO anon, authenticated;

-- 6) Gift cards: block customer minting
DROP POLICY IF EXISTS "gc_insert" ON public.gift_cards;
REVOKE INSERT ON public.gift_cards FROM anon, authenticated;
REVOKE SELECT ON public.gift_cards FROM anon;

CREATE OR REPLACE FUNCTION public.admin_create_gift_card(
  _amount numeric,
  _recipient_name text,
  _recipient_email text DEFAULT NULL,
  _message text DEFAULT NULL
) RETURNS public.gift_cards
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_code text;
  v_row public.gift_cards%ROWTYPE;
  v_chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  i int;
BEGIN
  IF v_uid IS NULL OR NOT public.has_role(v_uid, 'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  IF _amount IS NULL OR _amount <= 0 OR _amount > 100000 THEN
    RAISE EXCEPTION 'invalid_amount';
  END IF;
  v_code := 'GC-';
  FOR i IN 1..12 LOOP
    v_code := v_code || substr(v_chars, 1 + floor(random() * length(v_chars))::int, 1);
  END LOOP;

  INSERT INTO public.gift_cards(code, initial_amount, balance, sender_id,
    sender_email, recipient_name, recipient_email, message)
  VALUES (v_code, _amount, _amount, v_uid,
    (SELECT email FROM auth.users WHERE id = v_uid),
    _recipient_name, _recipient_email, _message)
  RETURNING * INTO v_row;
  RETURN v_row;
END; $$;
REVOKE ALL ON FUNCTION public.admin_create_gift_card(numeric, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_create_gift_card(numeric, text, text, text) TO authenticated;

-- 7) Internal SECURITY DEFINER helpers: revoke public execute
REVOKE EXECUTE ON FUNCTION public.calculate_sales_velocity(uuid) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.generate_pos_receipt_no() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.generate_order_number() FROM anon, authenticated, PUBLIC;

-- 8) Reduce GraphQL surface for anon on sensitive tables
REVOKE SELECT ON public.user_roles FROM anon;
REVOKE SELECT ON public.profiles FROM anon;
REVOKE SELECT ON public.orders FROM anon;
REVOKE SELECT ON public.order_items FROM anon;
REVOKE SELECT ON public.loyalty_accounts FROM anon;
REVOKE SELECT ON public.loyalty_transactions FROM anon;
REVOKE SELECT ON public.pos_transactions FROM anon;
REVOKE SELECT ON public.pos_transaction_items FROM anon;
REVOKE SELECT ON public.pos_payments FROM anon;
REVOKE SELECT ON public.pos_shifts FROM anon;
REVOKE SELECT ON public.pos_cash_movements FROM anon;
REVOKE SELECT ON public.pos_refunds FROM anon;
REVOKE SELECT ON public.gift_card_redemptions FROM anon;
REVOKE SELECT ON public.wishlists FROM anon;
REVOKE SELECT ON public.cart_items FROM anon;
REVOKE SELECT ON public.ai_chat_sessions FROM anon;
REVOKE SELECT ON public.ai_chat_messages FROM anon;
REVOKE SELECT ON public.referrals FROM anon;
REVOKE SELECT ON public.gdrive_settings FROM anon;
REVOKE SELECT ON public.gdrive_backups FROM anon;
