
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email,
          COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
          'customer');
  RETURN NEW;
END;
$$;

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can manage their cart" ON public.cart_items;
CREATE POLICY "Users manage own cart" ON public.cart_items
  FOR ALL
  USING (customer_id IS NOT NULL AND customer_id = auth.uid())
  WITH CHECK (customer_id IS NOT NULL AND customer_id = auth.uid());

DROP POLICY IF EXISTS "Approved reviews are public" ON public.reviews;

CREATE OR REPLACE VIEW public.public_reviews
WITH (security_invoker = true) AS
SELECT id, product_id, customer_id, rating, title, content,
       helpful_count, is_verified_purchase, created_at
FROM public.reviews
WHERE status = 'approved';

GRANT SELECT ON public.public_reviews TO anon, authenticated;

CREATE POLICY "Approved reviews readable" ON public.reviews
  FOR SELECT USING (status = 'approved');

REVOKE SELECT ON public.reviews FROM anon;
GRANT SELECT (id, product_id, customer_id, rating, title, content,
              helpful_count, is_verified_purchase, status, created_at, updated_at)
  ON public.reviews TO anon;

REVOKE SELECT ON public.products FROM anon, authenticated;
GRANT SELECT (
  id, name, slug, description, description_html, price, compare_at_price,
  category, subcategory, brand, tags, images, thumbnail_url, sku, barcode,
  weight, weight_unit, status, is_featured, seo_title, seo_description,
  created_at, updated_at
) ON public.products TO anon, authenticated;

ALTER PUBLICATION supabase_realtime DROP TABLE public.inventory;

DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for product images" ON storage.objects;

CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images'
  AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can update product images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-images'
  AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.generate_order_number() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.calculate_sales_velocity(uuid) FROM anon, authenticated, PUBLIC;

CREATE OR REPLACE FUNCTION public.search_products_by_embedding(
  query_embedding vector, match_threshold double precision DEFAULT 0.5,
  match_count integer DEFAULT 10
)
RETURNS TABLE(id uuid, name text, description text, price numeric,
              thumbnail_url text, category text, similarity double precision)
LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.name, p.description, p.price, p.thumbnail_url, p.category,
         1 - (p.embedding <=> query_embedding) as similarity
  FROM public.products p
  WHERE p.status = 'active' AND p.embedding IS NOT NULL
    AND 1 - (p.embedding <=> query_embedding) > match_threshold
  ORDER BY p.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

COMMENT ON TABLE public.profiles IS E'@graphql({"ignore": true})';
COMMENT ON TABLE public.inventory IS E'@graphql({"ignore": true})';
COMMENT ON TABLE public.orders IS E'@graphql({"ignore": true})';
COMMENT ON TABLE public.order_items IS E'@graphql({"ignore": true})';
COMMENT ON TABLE public.cart_items IS E'@graphql({"ignore": true})';
COMMENT ON TABLE public.daily_stats IS E'@graphql({"ignore": true})';
COMMENT ON TABLE public.reviews IS E'@graphql({"ignore": true})';
COMMENT ON TABLE public.products IS E'@graphql({"ignore": true})';
