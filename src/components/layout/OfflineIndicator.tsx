import { useState, useEffect } from 'react';
import { WifiOff, X } from 'lucide-react';
import { useI18n } from '@/stores/i18nStore';
import { AnimatePresence, motion } from 'framer-motion';

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isVisible, setIsVisible] = useState(!navigator.onLine);
  const { t } = useI18n();

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setIsVisible(false);
    };
    const handleOffline = () => {
      setIsOffline(true);
      setIsVisible(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-destructive text-destructive-foreground px-4 py-2 rounded-full shadow-lg text-sm font-medium"
        >
          <WifiOff className="h-4 w-4" />
          <span>{t('offline_warning') || 'You are currently offline'}</span>
          <button
            onClick={() => setIsVisible(false)}
            className="ml-2 hover:bg-destructive-foreground/20 rounded-full p-0.5 transition-colors"
            aria-label="Dismiss offline warning"
          >
            <X className="h-3 w-3" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
