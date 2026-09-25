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
import { Share2 } from 'lucide-react';
import { WishlistButton } from '@/components/products/WishlistButton';


import { Link } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';


export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { items, addItem } = useCartStore();
  const addRecentlyViewed = useRecentlyViewedStore((state) => state.addProduct);
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [quantity, setQuantity] = useState(1);

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
      addRecentlyViewed({
        id: product.id,
        name: product.name,
        price: product.price,
        compare_at_price: product.compare_at_price,
        thumbnail_url: product.thumbnail_url || product.images?.[0] || null,
        category: product.category,
        slug: product.slug,
        description: product.description
      });
    }
  }, [product, addRecentlyViewed]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!product) {
    return <div className="text-center py-12">Product not found</div>;
  }

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      thumbnail_url: product.thumbnail_url || product.images?.[0] || null,
    }, quantity);
    toast.success(`เพิ่มสินค้าลงตะกร้า ${quantity} ชิ้น`);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('ลิงก์ถูกคัดลอกเรียบร้อยแล้ว');
    } catch (err) {
      toast.error('ไม่สามารถคัดลอกลิงก์ได้');
    }
  };

  return (
    <div className="container py-8">

      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {product.category && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={`/products?category=${encodeURIComponent(product.category)}`}>{product.category}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            <BreadcrumbItem>
              <BreadcrumbPage className="truncate max-w-[200px] sm:max-w-md">{product.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid md:grid-cols-2 gap-8"
      >
        <div className="space-y-4">
          <img
            src={product.images?.[selectedImage] || product.thumbnail_url || '/placeholder.png'}
            alt={product.name}
            className="w-full rounded-lg aspect-square object-cover"
          />
          {product.images && product.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto py-2 scrollbar-hide">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 rounded-md overflow-hidden border-2 flex-shrink-0 transition-all ${
                    selectedImage === idx ? 'border-primary opacity-100' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${product.name} - Image ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-xl font-semibold">฿{product.price}</p>
          <p className="text-muted-foreground">{product.description}</p>

          <div className="flex items-center gap-4 py-2">
            <span className="font-medium text-sm">จำนวน:</span>
            <div className="flex items-center border border-border rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition rounded-l-lg"
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="w-10 text-center font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition rounded-r-lg"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 transition"
            >
              Add to Cart
            </button>
            <div className="flex gap-2">
              <WishlistButton productId={product.id} className="h-[46px] w-[46px] rounded-lg bg-transparent border border-border shadow-none hover:bg-accent flex items-center justify-center relative scale-100 transition-colors" />
              <button
                onClick={handleShare}
                className="h-[46px] w-[46px] border border-border rounded-lg hover:bg-accent transition flex items-center justify-center"
                title="Share"
              >
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>
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
