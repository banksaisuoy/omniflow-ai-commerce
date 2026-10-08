import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { ScrollToTop } from './ScrollToTop';
import { AnnouncementBar } from './AnnouncementBar';
import { OfflineIndicator } from './OfflineIndicator';
import { CookieConsent } from './CookieConsent';
import { FloatingContact } from './FloatingContact';
import { FloatingShare } from './FloatingShare';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AnnouncementBar />
      <OfflineIndicator />
      <Navbar />
      <motion.main
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
    </div>
  );
}
