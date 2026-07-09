import DOMPurify from 'dompurify';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ShoppingCart, Minus, Plus, Star, Truck, Shield, RotateCcw, Share2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useCartStore } from '@/stores/cartStore';
import { useRecentlyViewedStore } from '@/stores/recentlyViewedStore';
import { ProductCard } from '@/components/products/ProductCard';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  thumbnail_url: string | null;
  category: string | null;
  slug: string;
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);
  const { products: recentlyViewedProducts, addProduct: addRecentlyViewedProduct } = useRecentlyViewedStore();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const { data: relatedProducts } = useQuery({
    queryKey: ['related-products', product?.category, product?.id],
    queryFn: async () => {
      if (!product?.category) return [];
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', product.category)
        .neq('id', product.id)
        .eq('status', 'active')
        .limit(4);
      if (error) throw error;
      return data;
    },
    enabled: !!product?.category && !!product?.id,
  });

  useEffect(() => {
    if (product) {
      addRecentlyViewedProduct({
        id: product.id,
        name: product.name,
        price: product.price,
        compare_at_price: product.compare_at_price,
        thumbnail_url: product.thumbnail_url,
        category: product.category,
        slug: product.slug,
        description: product.description,
      });
    }
  }, [product, addRecentlyViewedProduct]);

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        thumbnail_url: product.thumbnail_url,
      });
    }
    toast.success(`เพิ่ม ${quantity} ชิ้น ลงตะกร้าแล้ว`);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">ไม่พบสินค้า</h1>
          <p className="text-muted-foreground">สินค้าที่คุณค้นหาอาจถูกลบหรือไม่มีอยู่</p>
        </div>
      </Layout>
    );
  }

  const discount = product.compare_at_price
    ? Math.round((1 - product.price / product.compare_at_price) * 100)
    : null;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid md:grid-cols-2 gap-8 lg:gap-12"
        >
          {/* Product Image */}
          <div className="relative">
            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
              {product.thumbnail_url ? (
                <img
                  src={product.thumbnail_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No Image
                </div>
              )}
            </div>
            {discount && (
              <Badge className="absolute top-4 left-4 bg-destructive text-lg px-3 py-1">
                -{discount}%
              </Badge>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {product.category && (
              <Badge variant="outline">{product.category}</Badge>
            )}
            <h1 className="text-3xl font-bold">{product.name}</h1>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary">
                ฿{product.price.toLocaleString()}
              </span>
              {product.compare_at_price && (
                <span className="text-xl text-muted-foreground line-through">
                  ฿{product.compare_at_price.toLocaleString()}
                </span>
              )}
            </div>

            {/* Description */}
            {product.description_html ? (
              <div
                className="prose prose-sm max-w-none text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.description_html) }}
              />
            ) : product.description ? (
              <p className="text-muted-foreground">{product.description}</p>
            ) : null}

            {/* Tags */}
            {product.tags && Array.isArray(product.tags) && (
              <div className="flex flex-wrap gap-2">
                {(product.tags as string[]).map((tag, i) => (
                  <Badge key={i} variant="secondary">{tag}</Badge>
                ))}
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-border rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button size="lg" className="flex-1" onClick={handleAddToCart}>
                <ShoppingCart className="mr-2 h-5 w-5" />
                เพิ่มลงตะกร้า
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11 shrink-0"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('คัดลอกลิงก์สำเร็จ');
                }}
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
              <div className="text-center">
                <Truck className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-xs text-muted-foreground">จัดส่งฟรี</p>
              </div>
              <div className="text-center">
                <Shield className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-xs text-muted-foreground">รับประกันคุณภาพ</p>
              </div>
              <div className="text-center">
                <RotateCcw className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-xs text-muted-foreground">คืนได้ 30 วัน</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-16 pt-16 border-t border-border">
            <h2 className="text-2xl font-bold mb-8">สินค้าที่เกี่ยวข้อง</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p as Product} />
              ))}
            </div>
          </div>
        )}

        {/* Recently Viewed */}
        {recentlyViewedProducts.filter(p => p.id !== product?.id).length > 0 && (
          <div className="mt-16 pt-16 border-t border-border">
            <h2 className="text-2xl font-bold mb-8">สินค้าที่ดูล่าสุด</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {recentlyViewedProducts
                .filter(p => p.id !== product?.id)
                .slice(0, 4)
                .map((p) => (
                  <ProductCard key={p.id} product={p as Product} />
                ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
