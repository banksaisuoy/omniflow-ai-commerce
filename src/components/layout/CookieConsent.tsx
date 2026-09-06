import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem('cookie-consent', 'true');
    } catch (e) {
      console.error('Failed to save cookie consent', e);
    }
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-[100] p-4 sm:p-6"
        >
          <div className="mx-auto max-w-4xl bg-background border border-border shadow-lg rounded-lg p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex-1 text-sm text-muted-foreground text-center sm:text-left">
              เราใช้คุกกี้เพื่อปรับปรุงประสบการณ์การใช้งานของคุณ อ่านเพิ่มเติมได้ที่
              <a href="#" className="text-primary hover:underline ml-1">นโยบายความเป็นส่วนตัว</a>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button onClick={handleAccept} className="w-full sm:w-auto">
                ยอมรับ
              </Button>
              <button
                onClick={() => setIsVisible(false)}
                className="p-2 hover:bg-muted rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
