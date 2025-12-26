export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  description_html: string | null;
  price: number;
  compare_at_price: number | null;
  cost_price: number | null;
  category: string | null;
  subcategory: string | null;
  brand: string | null;
  tags: string[];
  images: string[];
  thumbnail_url: string | null;
  sku: string | null;
  barcode: string | null;
  weight: number | null;
  weight_unit: string;
  status: 'draft' | 'active' | 'archived';
  is_featured: boolean;
  seo_title: string | null;
  seo_description: string | null;
  embedding: number[] | null;
  ai_generated_data: AIProductData | null;
  created_at: string;
  updated_at: string;
}

export interface AIProductData {
  name: string;
  colors: string[];
  category: string;
  subcategory: string;
  description_html: string;
  price_range: {
    min: number;
    max: number;
    suggested: number;
    currency: string;
  };
  tags: string[];
  seo_title: string;
  seo_description: string;
}

export interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  description_html: string;
  price: number;
  compare_at_price?: number;
  category: string;
  subcategory: string;
  brand: string;
  tags: string[];
  images: string[];
  thumbnail_url: string;
  sku: string;
  status: 'draft' | 'active' | 'archived';
  is_featured: boolean;
  seo_title: string;
  seo_description: string;
}

export interface Inventory {
  id: string;
  product_id: string;
  quantity: number;
  reserved_quantity: number;
  low_stock_threshold: number;
  reorder_point: number;
  reorder_quantity: number;
  supplier_name: string | null;
  supplier_contact: string | null;
  last_restocked_at: string | null;
  sales_velocity: number;
  created_at: string;
  updated_at: string;
}
