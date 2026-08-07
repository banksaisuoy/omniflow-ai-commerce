import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Toggle visibility
          setIsVisible(window.scrollY > 300);

          // Calculate progress
          const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
          if (scrollHeight > 0) {
            const progress = (window.scrollY / scrollHeight) * 100;
            setScrollProgress(Math.min(100, Math.max(0, progress)));
          } else {
            setScrollProgress(0);
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-24 right-6 z-50 flex items-center justify-center group"
        >
          {/* Circular Progress Ring */}
          <div className="absolute inset-0 pointer-events-none w-[52px] h-[52px] -m-[2px]">
             <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
               <circle
                 cx="50"
                 cy="50"
                 r="46"
                 fill="none"
                 className="stroke-muted opacity-50"
                 strokeWidth="8"
               />
               <circle
                 cx="50"
                 cy="50"
                 r="46"
                 fill="none"
                 className="stroke-primary transition-all duration-150 ease-out"
                 strokeWidth="8"
                 strokeLinecap="round"
                 strokeDasharray="289.026"
                 strokeDashoffset={289.026 - (289.026 * scrollProgress) / 100}
               />
             </svg>
          </div>

          <Button
            size="icon"
            className="relative rounded-full shadow-lg h-12 w-12 bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-110 transition-all duration-300"
            onClick={scrollToTop}
            aria-label="Scroll to top"
          >
            <ArrowUp className="h-6 w-6" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
