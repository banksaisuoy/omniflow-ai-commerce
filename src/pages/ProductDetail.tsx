import { useCartStore } from '@/stores/cartStore';
import { useRecentlyViewedStore } from '@/stores/recentlyViewedStore';
import { ProductCard } from '@/components/products/ProductCard';
import { RecommendationCarousel } from '@/components/RecommendationCarousel';
import { toast } from 'sonner';
import { PRODUCT_PUBLIC_FIELDS } from '@/lib/productFields';

          </div>
        </motion.div>

        {/* Recommendation Carousel */}
        <div className="mt-16">
          <RecommendationCarousel productId={product.id} title="You might also like" />
        </div>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-16 pt-16 border-t border-border">
