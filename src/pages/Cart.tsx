  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useCartStore } from '@/stores/cartStore';
import { useState, useEffect } from 'react';
import { useRecentlyViewedStore } from '@/stores/recentlyViewedStore';
import { ProductCard } from '@/components/products/ProductCard';
import { supabase } from '@/integrations/supabase/client';
import { RecentlyViewedProduct } from '@/stores/recentlyViewedStore';
import './cart.scss';

export default function Cart() {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart, getTotalItems, orderNote, setOrderNote } = useCartStore();
  const { products: storedRecentlyViewedProducts } = useRecentlyViewedStore();
  const [recentlyViewedProducts, setRecentlyViewedProducts] = useState<RecentlyViewedProduct[]>([]);

  useEffect(() => {
    const fetchFreshRecentlyViewed = async () => {
      if (!storedRecentlyViewedProducts || storedRecentlyViewedProducts.length === 0) return;

      const productIds = storedRecentlyViewedProducts.map(p => p.id);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds)
        .eq('status', 'active');

      if (!error && data) {
        // Maintain the original viewing order from the store
        const freshProductsMap = new Map(data.map(p => [p.id, p]));
        const orderedFreshProducts = storedRecentlyViewedProducts
          .map(p => freshProductsMap.get(p.id))
          .filter(Boolean) as RecentlyViewedProduct[];
          
        setRecentlyViewedProducts(orderedFreshProducts);
      }
    };

    fetchFreshRecentlyViewed();
  }, [storedRecentlyViewedProducts]);

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 cart-empty-state">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        </div>

        {recentlyViewedProducts.length > 0 && (
          <div className="container mx-auto px-4 pb-16 cart-recently-viewed">
            <h2>สินค้าที่คุณอาจสนใจ</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {recentlyViewedProducts.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p as any} />
            </Card>
          </div>
        </div>
        
        {recentlyViewedProducts.length > 0 && (
          <div className="cart-recently-viewed">
            <h2>สินค้าที่คุณอาจสนใจ</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {recentlyViewedProducts.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p as any} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );