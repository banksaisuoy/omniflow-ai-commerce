import { useState, useEffect } from 'react';
import { History, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useRecentlyViewedStore } from '@/stores/recentlyViewedStore';
import { Link } from 'react-router-dom';
import { useI18n } from '@/stores/i18nStore';

export function FloatingRecentlyViewed() {
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { products, clearProducts } = useRecentlyViewedStore();
  const { t } = useI18n();

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!products || products.length === 0) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-32 left-0 z-40 flex items-end group"
        >
          {/* Main Button */}
          <Button
            className="rounded-r-full rounded-l-none shadow-lg h-12 px-4 bg-background text-foreground hover:bg-muted border border-l-0 border-border transition-all duration-300 z-50 flex items-center gap-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Recently Viewed"
          >
            <History className="h-5 w-5 text-primary" />
            {!isOpen && <span className="text-xs font-medium">{t('recently_viewed_short') || 'ล่าสุด'}</span>}
          </Button>

          {/* Expanded Drawer */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute left-0 bottom-14 ml-4 bg-background border border-border shadow-xl rounded-xl w-[280px] p-4 z-40 origin-bottom-left"
              >
                <div className="flex items-center justify-between mb-3 border-b border-border/50 pb-2">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <History className="h-4 w-4" /> {t('recently_viewed') || 'ดูล่าสุด'}
                  </h3>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] text-muted-foreground hover:text-destructive" onClick={clearProducts}>
                      {t('clear') || 'ล้าง'}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => setIsOpen(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-hide">
                  {products.slice(0, 5).map((product) => (
                    <Link
                      key={product.id}
                      to={`/products/${product.id}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="w-12 h-12 rounded-md bg-muted overflow-hidden flex-shrink-0">
                        {product.thumbnail_url ? (
                          <img src={product.thumbnail_url} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[8px] text-muted-foreground">{t('no_image') || 'ไม่มีรูป'}</div>
                        )}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-xs font-medium line-clamp-1">{product.name}</p>
                        <p className="text-xs text-primary font-semibold">฿{product.price}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
