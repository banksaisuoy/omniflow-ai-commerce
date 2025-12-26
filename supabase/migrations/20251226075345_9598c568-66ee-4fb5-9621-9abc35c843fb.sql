-- Fix function search paths for security
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.search_products_by_embedding(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  price decimal,
  thumbnail_url text,
  category text,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.description,
    p.price,
    p.thumbnail_url,
    p.category,
    1 - (p.embedding <=> query_embedding) as similarity
  FROM public.products p
  WHERE p.status = 'active'
    AND p.embedding IS NOT NULL
    AND 1 - (p.embedding <=> query_embedding) > match_threshold
  ORDER BY p.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_order_number TEXT;
BEGIN
  new_order_number := 'OMN-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN new_order_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.calculate_sales_velocity(p_product_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  velocity DECIMAL;
BEGIN
  SELECT COALESCE(SUM(oi.quantity), 0)::DECIMAL / 30
  INTO velocity
  FROM public.order_items oi
  JOIN public.orders o ON o.id = oi.order_id
  WHERE oi.product_id = p_product_id
    AND o.created_at >= NOW() - INTERVAL '30 days'
    AND o.status NOT IN ('cancelled', 'refunded');
  
  RETURN velocity;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;