import { ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useCartStore } from '@/stores/cartStore';

import { motion } from 'framer-motion';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { ScrollToTop } from './ScrollToTop';
import { AnnouncementBar } from './AnnouncementBar';
import { ScrollProgressBar } from './ScrollProgressBar';
import { OfflineIndicator } from './OfflineIndicator';
import { CookieConsent } from './CookieConsent';
import { FloatingContact } from './FloatingContact';
import { FloatingShare } from './FloatingShare';
import { FloatingRecentlyViewed } from './FloatingRecentlyViewed';
import { FloatingCartSummary } from './FloatingCartSummary';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { pathname } = useLocation();
  const cartItems = useCartStore((state) => state.items);
  const itemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    if (itemsCount > 0) {
      document.title = `(${itemsCount}) Khanom House`;
    } else {
      document.title = 'Khanom House';
    }
  }, [itemsCount]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:p-4 focus:bg-background focus:text-foreground">
        Skip to main content
      </a>
      <ScrollProgressBar />
      <AnnouncementBar />
      <OfflineIndicator />
      <Navbar />
      <motion.main
        id="main-content"
        className="flex-1"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {children}
      </motion.main>
      <Footer />
      <ScrollToTop />
      <CookieConsent />
      <FloatingContact />
      <FloatingShare />
      <FloatingRecentlyViewed />
      <FloatingCartSummary />
    </div>
  );
}
