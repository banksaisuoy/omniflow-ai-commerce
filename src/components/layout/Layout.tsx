import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { ScrollToTop } from './ScrollToTop';
import { AnnouncementBar } from './AnnouncementBar';
import { OfflineIndicator } from './OfflineIndicator';
import { CookieConsent } from './CookieConsent';
import { FloatingContact } from './FloatingContact';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AnnouncementBar />
      <OfflineIndicator />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <ScrollToTop />
      <CookieConsent />
      <FloatingContact />
    </div>
  );
}
