import { useCartStore } from '@/stores/cartStore';
import { useRecentlyViewedStore } from '@/stores/recentlyViewedStore';
import { ProductCard } from '@/components/products/ProductCard';
import { WishlistButton } from '@/components/products/WishlistButton';
import { toast } from 'sonner';
import { PRODUCT_PUBLIC_FIELDS } from '@/lib/productFields';

              >
                <Share2 className="h-5 w-5" />
              </Button>
              <div className="h-11 w-11 shrink-0 flex items-center justify-center border border-input rounded-md hover:bg-accent transition-colors relative">
                <WishlistButton productId={product.id} className="w-full h-full bg-transparent shadow-none hover:scale-100 absolute inset-0" />
              </div>
            </div>

            {/* Features */}