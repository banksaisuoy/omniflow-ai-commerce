import { Layout } from '@/components/layout/Layout';
import { FlashSaleBanner } from '@/components/marketing/FlashSaleBanner';
import heroImg from '@/assets/hero-thai-desserts.jpg';
import { RecommendationCarousel } from '@/components/RecommendationCarousel';
import khanomChan from '@/assets/feature-khanom-chan.jpg';
import mangoSticky from '@/assets/feature-mango-sticky.jpg';
import { ForYouFeed } from '@/components/recommendations/ForYouFeed';
  return (
    <Layout>
      <FlashSaleBanner />
      <RecommendationCarousel productId="test" limit={4} context="pdp" />
      {/* Hero — Bento Grid */}

      <section className="relative overflow-hidden bg-gradient-hero">
