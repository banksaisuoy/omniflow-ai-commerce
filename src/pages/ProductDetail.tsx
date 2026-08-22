import { useCartStore } from '@/stores/cartStore';
import { useRecentlyViewedStore } from '@/stores/recentlyViewedStore';
import { ProductCard } from '@/components/products/ProductCard';
import { RecommendationCarousel } from '@/components/RecommendationCarousel';
import { toast } from 'sonner';
import { PRODUCT_PUBLIC_FIELDS } from '@/lib/productFields';

          </div>
        </motion.div>

        {/* Recommendation Carousel */}
        {product && (
          <RecommendationCarousel productId={product.id} />
        )}

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-16 pt-16 border-t border-border">