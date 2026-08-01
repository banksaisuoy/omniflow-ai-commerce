import { useRecentlyViewedStore } from '@/stores/recentlyViewedStore';
import { ProductCard } from '@/components/products/ProductCard';
import { toast } from 'sonner';
import { RecommendationCarousel } from '@/components/RecommendationCarousel';

interface Product {
  id: string;
          </div>
        </motion.div>

        <RecommendationCarousel productId={product.id} />

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-16 pt-16 border-t border-border">