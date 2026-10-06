import { useState, useEffect } from 'react';
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export function FloatingShare() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Khanom House',
          text: 'ดูหน้านี้ที่ Khanom House',
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('ลิงก์ถูกคัดลอกเรียบร้อยแล้ว');
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        toast.error('ไม่สามารถแชร์หรือคัดลอกลิงก์ได้');
      }
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-24 left-6 z-50 flex items-center justify-center group"
        >
          <Button
            size="icon"
            className="relative rounded-full shadow-lg h-12 w-12 bg-secondary text-secondary-foreground hover:bg-secondary/90 hover:scale-110 transition-all duration-300"
            onClick={handleShare}
            aria-label="Share this page"
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
