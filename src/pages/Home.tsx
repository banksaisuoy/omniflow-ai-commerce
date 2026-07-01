import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Sparkles, Truck, Heart, Star, ArrowRight, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useActiveFlashSale, useCountdown } from '@/hooks/useFlashSales';
import { ProductCard } from '@/components/products/ProductCard';
import { Clock, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Layout } from '@/components/layout/Layout';
import { FlashSaleBanner } from '@/components/marketing/FlashSaleBanner';
import heroImg from '@/assets/hero-thai-desserts.jpg';
import khanomChan from '@/assets/feature-khanom-chan.jpg';
import mangoSticky from '@/assets/feature-mango-sticky.jpg';
import { ForYouFeed } from '@/components/recommendations/ForYouFeed';
import { SmartReorder } from '@/components/recommendations/SmartReorder';


const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.6, ease: 'easeOut' as const },
};

export default function Home() {
  const { data: flashSale } = useActiveFlashSale();
  const flashSaleCountdown = useCountdown(flashSale?.ends_at);
  return (
    <Layout>
      <FlashSaleBanner />
      {/* Hero — Bento Grid */}

      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 md:gap-5 auto-rows-[minmax(140px,auto)]">
            {/* Big headline tile */}
            <motion.div
              {...fadeUp}
              className="md:col-span-4 md:row-span-2 bento-tile p-8 md:p-12 flex flex-col justify-between bg-gradient-warm relative overflow-hidden"
            >
              <div className="relative z-10">
                <Badge className="bg-white/70 text-primary border-0 mb-6 backdrop-blur">
                  <Sparkles className="h-3 w-3 mr-1.5" />
                  สูตรต้นตำรับ โฮมเมดทุกชิ้น
                </Badge>
                <h1 className="font-display text-5xl md:text-7xl leading-[1.05] mb-6 text-foreground">
                  ขนมไทย<br />
                  <span className="gradient-text italic">หวานละมุน</span><br />
                  ส่งตรงถึงบ้าน
                </h1>
                <p className="text-base md:text-lg text-muted-foreground max-w-md mb-8">
                  คัดสรรขนมไทยโบราณกว่า 50 ชนิด ทำสดใหม่ทุกวัน
                  จากร้านขนมเล็กๆ ที่อยากให้คุณได้ลิ้มรสความหวานในแบบไทยแท้
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button size="lg" asChild className="rounded-full px-7 shadow-soft">
                    <Link to="/products">
                      <ShoppingBag className="mr-2 h-5 w-5" />
                      เลือกซื้อขนม
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="rounded-full px-7 bg-white/60 backdrop-blur border-primary/20">
                    <Link to="/products">
                      ดูเมนูทั้งหมด
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              {/* Decorative dots */}
              <div className="absolute -bottom-8 -right-8 w-48 h-48 rounded-full bg-primary/10 blur-3xl" />
              <div className="absolute top-4 right-8 w-32 h-32 rounded-full bg-mango/20 blur-2xl" />
            </motion.div>

            {/* Hero image tile */}
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="md:col-span-2 md:row-span-2 bento-tile overflow-hidden relative group"
            >
              <img
                src={heroImg}
                alt="ขนมไทยหลากชนิด"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                width={1536}
                height={1024}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <Badge className="bg-white/90 text-foreground border-0">
                  <Heart className="h-3 w-3 mr-1 text-primary fill-primary" />
                  ขายดีอันดับ 1
                </Badge>
              </div>
            </motion.div>

            {/* Stat tile */}
            <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.15 }} className="md:col-span-2 bento-tile p-6 flex flex-col justify-center bg-white">
              <div className="font-display text-5xl gradient-text mb-1">10K+</div>
              <p className="text-sm text-muted-foreground">ลูกค้าประจำที่หลงรักรสชาติเรา</p>
              <div className="flex gap-0.5 mt-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-mango text-mango" />
                ))}
                <span className="text-sm text-muted-foreground ml-2">4.9 จาก 2,341 รีวิว</span>
              </div>
            </motion.div>

            {/* Free delivery tile */}
            <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.2 }} className="md:col-span-2 bento-tile p-6 bg-secondary/40 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-soft">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">ส่งฟรี</p>
                <p className="text-xs text-muted-foreground">เมื่อซื้อครบ 500 บาท ทั่วกรุงเทพฯ</p>
              </div>
            </motion.div>

            {/* Natural tile */}
            <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.25 }} className="md:col-span-2 bento-tile p-6 bg-pandan/15 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-soft">
                <Leaf className="h-6 w-6 text-pandan" />
              </div>
              <div>
                <p className="font-semibold">ไร้สีสังเคราะห์</p>
                <p className="text-xs text-muted-foreground">ใช้สีธรรมชาติจากใบเตย ดอกอัญชัน</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>


      {/* Flash Sale Banner */}
      {flashSale && flashSale.items && flashSale.items.length > 0 && (
        <section className="py-8 bg-destructive/5 border-y border-destructive/10">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-destructive fill-destructive" />
                </div>
                <div>
                  <h2 className="font-display text-2xl text-destructive">{flashSale.name}</h2>
                  <p className="text-sm text-muted-foreground">{flashSale.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 md:mt-0 bg-white px-4 py-2 rounded-full shadow-sm border border-destructive/20">
                <Clock className="h-4 w-4 text-destructive" />
                <span className="font-mono font-bold text-destructive">จบใน {flashSaleCountdown}</span>
              </div>
            </div>

            <div className="flex overflow-x-auto pb-6 -mx-4 px-4 snap-x gap-4 md:gap-6 no-scrollbar">
              {flashSale.items.map((item: any) => (
                <div key={item.id} className="min-w-[280px] md:min-w-[320px] snap-start">
                  <ProductCard
                    product={item.product}
                    flashSaleData={{
                      sale_price: item.sale_price,
                      stock_limit: item.stock_limit,
                      sold_count: item.sold_count
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Dessert Bento */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 mb-4">
              เมนูแนะนำ
            </Badge>
            <h2 className="font-display text-4xl md:text-5xl mb-4">
              ขนมไทยสุดคลาสสิก <span className="italic gradient-text">ที่ต้องลอง</span>
            </h2>
            <p className="text-muted-foreground">
              คัดเลือกจากเมนูที่ขายดีและได้รับความนิยมมากที่สุด ทำสดวันต่อวัน
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 md:gap-5 auto-rows-[minmax(220px,auto)]">
            {/* Khanom Chan - big tile */}
            <motion.div {...fadeUp} className="md:col-span-4 md:row-span-2 bento-tile overflow-hidden group relative">
              <img
                src={khanomChan}
                alt="ขนมชั้น"
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                width={768}
                height={768}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <Badge className="bg-primary/90 border-0 mb-3">เมนูคลาสสิก</Badge>
                <h3 className="font-display text-3xl md:text-4xl mb-2">ขนมชั้นใบเตย</h3>
                <p className="text-white/90 max-w-md mb-4">9 ชั้นแห่งความหอมใบเตยแท้ๆ เนื้อนุ่ม เหนียว หวานกำลังดี</p>
                <Button asChild size="sm" variant="secondary" className="rounded-full">
                  <Link to="/products">ดูรายละเอียด <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></Link>
                </Button>
              </div>
            </motion.div>

            {/* Mango sticky */}
            <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.1 }} className="md:col-span-2 bento-tile overflow-hidden group relative">
              <img
                src={mangoSticky}
                alt="ข้าวเหนียวมะม่วง"
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                width={768}
                height={768}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="font-display text-xl">ข้าวเหนียวมะม่วง</h3>
                <p className="text-xs text-white/80">฿120</p>
              </div>
            </motion.div>

            {/* Category tile */}
            <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.15 }} className="md:col-span-2 bento-tile p-6 bg-gradient-warm flex flex-col justify-between">
              <div>
                <Badge className="bg-white/70 text-primary border-0 mb-3">โปรโมชั่น</Badge>
                <h3 className="font-display text-2xl leading-tight">ลด 20%<br />ทุกวันพุธ</h3>
                <p className="text-sm text-muted-foreground mt-2">ใช้โค้ด <span className="font-mono font-semibold text-primary">OMNI20</span></p>
              </div>
              <Button asChild variant="ghost" className="self-start rounded-full text-primary hover:bg-white/50 -ml-2">
                <Link to="/products">ดูเลย <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Smart Reorder */}
      <SmartReorder />

      {/* For You Feed */}
      <ForYouFeed />

      {/* Categories */}
      <section className="py-16 md:py-20 bg-gradient-soft">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl mb-3">เลือกตามหมวดหมู่</h2>
            <p className="text-muted-foreground">ขนมไทยทุกประเภทที่คุณรัก</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'ขนมหวาน', emoji: '🍡', color: 'bg-secondary/40' },
              { label: 'ขนมเปียก', emoji: '🥥', color: 'bg-pandan/15' },
              { label: 'ขนมแห้ง', emoji: '🍪', color: 'bg-mango/20' },
              { label: 'เครื่องดื่ม', emoji: '🧊', color: 'bg-butterfly/20' },
            ].map((cat, i) => (
              <motion.div
                key={cat.label}
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <Link
                  to="/products"
                  className={`bento-tile p-6 md:p-8 flex flex-col items-center justify-center text-center h-full ${cat.color}`}
                >
                  <div className="text-5xl mb-3">{cat.emoji}</div>
                  <h3 className="font-display text-xl">{cat.label}</h3>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            {...fadeUp}
            className="bento-tile bg-gradient-primary p-10 md:p-16 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,white,transparent_60%)] opacity-60" />
            <div className="relative z-10 max-w-2xl mx-auto">
              <Sparkles className="h-8 w-8 mx-auto mb-4 text-primary" />
              <h2 className="font-display text-3xl md:text-5xl mb-4 text-foreground">
                สั่งขนมล่วงหน้า <span className="italic">เพื่องานพิเศษ</span>
              </h2>
              <p className="text-foreground/80 mb-8">
                จัดเบรกประชุม งานบุญ งานแต่ง — เรามีเซ็ตขนมไทยพร้อมเสิร์ฟกว่า 30 รูปแบบ
              </p>
              <Button size="lg" asChild className="rounded-full px-8 shadow-soft bg-white text-primary hover:bg-white/90">
                <Link to="/products">ติดต่อสั่งเซ็ตพิเศษ</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
