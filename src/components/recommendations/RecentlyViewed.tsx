import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/products/ProductCard';
import { useRecentlyViewedStore } from '@/stores/recentlyViewedStore';

export function RecentlyViewed() {
  const { products, clearProducts } = useRecentlyViewedStore();

  if (!products || products.length === 0) return null;

  return (
    <section className="py-8 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 flex items-end justify-between"
        >
          <div>
            <h2 className="font-display text-2xl md:text-3xl mb-2">เข้าชมล่าสุด</h2>
            <p className="text-muted-foreground">สินค้าที่คุณเพิ่งเปิดดู</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearProducts}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            ล้างประวัติ
          </Button>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product as any} />
          ))}
        </div>
      </div>
    </section>
  );
}
