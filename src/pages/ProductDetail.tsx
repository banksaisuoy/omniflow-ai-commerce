import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCartStore } from '@/stores/cartStore';
import { useRecentlyViewedStore } from '@/stores/recentlyViewedStore';
import { ProductCard } from '@/components/products/ProductCard';
import { RecommendationCarousel } from '@/components/RecommendationCarousel';
import { toast } from 'sonner';
import { PRODUCT_PUBLIC_FIELDS } from '@/lib/productFields';
import { motion } from 'framer-motion';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { items, addItem } = useCartStore();
  const addRecentlyViewed = useRecentlyViewedStore((state) => state.addProduct);
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(PRODUCT_PUBLIC_FIELDS)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: relatedProducts } = useQuery({
    queryKey: ['products-related', product?.category, id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(PRODUCT_PUBLIC_FIELDS)
        .eq('category', product?.category || '')
        .eq('status', 'active')
        .neq('id', id)
        .limit(4);

      if (error) throw error;
      return data;
    },
    enabled: !!product?.category,
  });

  useEffect(() => {
    if (product) {
      addRecentlyViewed(product);
    }
  }, [product, addRecentlyViewed]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!product) {
    return <div className="text-center py-12">Product not found</div>;
  }

  const handleAddToCart = () => {
    addItem(product, 1);
    toast.success('Added to cart');
  };

  return (
    <div className="container py-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid md:grid-cols-2 gap-8"
      >
        <div className="space-y-4">
          <img src={product.image_url} alt={product.name} className="w-full rounded-lg" />
        </div>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-xl font-semibold">฿{product.price}</p>
          <p className="text-muted-foreground">{product.description}</p>
          <button 
            onClick={handleAddToCart}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg"
          >
            Add to Cart
          </button>
        </div>
      </motion.div>

      {/* Recommendation Carousel */}
      {product && (
        <RecommendationCarousel productId={product.id} />
      )}

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="mt-16 pt-16 border-t border-border">
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}