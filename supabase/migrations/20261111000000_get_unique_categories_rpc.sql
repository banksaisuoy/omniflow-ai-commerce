CREATE OR REPLACE FUNCTION get_unique_categories()
RETURNS TABLE (category text)
LANGUAGE sql
STABLE
AS $$
  SELECT DISTINCT category
  FROM products
  WHERE status = 'active' AND category IS NOT NULL;
$$;
