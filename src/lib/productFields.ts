// Public-safe product columns. `select('*')` is blocked by column-level grants
// (cost_price / embedding are admin-only), so always select explicitly.
export const PRODUCT_PUBLIC_FIELDS =
  'id,name,slug,description,description_html,price,compare_at_price,category,subcategory,brand,tags,images,thumbnail_url,sku,barcode,weight,weight_unit,status,is_featured,seo_title,seo_description,created_at,updated_at';
