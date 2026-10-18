import { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/stores/cartStore';
import { CartSheet } from '@/components/cart/CartSheet';

export function FloatingCartSummary() {
  const [isVisible, setIsVisible] = useState(false);
  const items = useCartStore((state) => state.items);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (totalItems === 0) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-36 right-6 z-50 flex items-center justify-center group"
        >
          <CartSheet>
            <Button
              className="relative rounded-full shadow-lg h-12 px-4 bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all duration-300 flex items-center gap-2"
              aria-label="View Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              <div className="flex flex-col items-start leading-none">
                <span className="text-[10px] font-medium opacity-80">ตะกร้าสินค้า ({totalItems})</span>
                <span className="text-xs font-bold">฿{totalPrice.toLocaleString()}</span>
              </div>
            </Button>
          </CartSheet>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
