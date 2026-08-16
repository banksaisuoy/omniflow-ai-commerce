import { ProductCard } from '@/components/products/ProductCard';
import { toast } from 'sonner';
import { PRODUCT_PUBLIC_FIELDS } from '@/lib/productFields';
import { RecommendationCarousel } from '@/components/RecommendationCarousel';

interface Product {
  id: string;
            </div>
          </div>
        )}

        {/* AI Recommendations */}
        <div className="mt-8">
          <RecommendationCarousel productId={product.id} title="You might also like" />
        </div>
      </div>
    </Layout>
  );
