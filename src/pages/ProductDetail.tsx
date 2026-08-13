import { useCartStore } from '@/stores/cartStore';
import { useRecentlyViewedStore } from '@/stores/recentlyViewedStore';
import { ProductCard } from '@/components/products/ProductCard';
import { RecommendationCarousel } from '@/components/RecommendationCarousel';
import { toast } from 'sonner';
import { PRODUCT_PUBLIC_FIELDS } from '@/lib/productFields';

            </div>
          </div>
        )}

        {/* AI Recommendations */}
        {product && (
          <RecommendationCarousel productId={product.id} title="You might also like" />
        )}
      </div>
    </Layout>
  );
