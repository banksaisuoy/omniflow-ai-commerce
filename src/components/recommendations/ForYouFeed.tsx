import { motion } from 'framer-motion';
import { ProductCard } from '@/components/products/ProductCard';
import { Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Mock data to simulate pgvector/embedding recommendations
const recommendedProducts = [
  {
    id: 'rec-1',
    name: 'ขนมเปียกปูนใบเตย',
    description: 'เนื้อเนียนนุ่ม หอมกลิ่นใบเตยคั้นสด เสิร์ฟพร้อมกะทิสด',
    price: 45,
    compare_at_price: null,
    thumbnail_url: 'https://images.unsplash.com/photo-1559598467-f8b76c8155d0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'ขนมเปียก',
    slug: 'kanom-piakpoon-pandan'
  },
  {
    id: 'rec-2',
    name: 'ทองหยิบ',
    description: 'เนื้อนุ่ม หวานกำลังดี จัดจีบสวยงามแบบต้นตำรับ',
    price: 80,
    compare_at_price: null,
    thumbnail_url: 'https://images.unsplash.com/photo-1601000938259-9e92002320b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'ขนมมงคล',
    slug: 'thong-yip'
  },
  {
    id: 'rec-3',
    name: 'ขนมสอดไส้',
    description: 'ไส้มะพร้าวหวานหอม ห่อด้วยแป้งนุ่มๆ และใบตอง',
    price: 35,
    compare_at_price: 40,
    thumbnail_url: 'https://images.unsplash.com/photo-1621256725350-1d8825e3692d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'ขนมไทยโบราณ',
    slug: 'kanom-sod-sai'
  },
  {
    id: 'rec-4',
    name: 'บัวลอยเบญจรงค์',
    description: 'บัวลอย 5 สีจากธรรมชาติ ในน้ำกะทิหอมกรุ่น',
    price: 50,
    compare_at_price: null,
    thumbnail_url: 'https://images.unsplash.com/photo-1563805042-7684c8a9e9ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'ขนมน้ำ',
    slug: 'bua-loy'
  }
];

export function ForYouFeed() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8">
          <div>
            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 mb-4 flex w-fit items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              AI แนะนำสำหรับคุณ
            </Badge>
            <h2 className="font-display text-3xl md:text-4xl">
              คัดสรรมา <span className="italic gradient-text">เพื่อคุณโดยเฉพาะ</span>
            </h2>
            <p className="text-muted-foreground mt-2">
              ประมวลผลจากความชอบและการสั่งซื้อที่ผ่านมา
            </p>
          </div>
        </div>

        <div className="flex overflow-x-auto pb-6 -mx-4 px-4 snap-x gap-4 md:gap-6 no-scrollbar">
          {recommendedProducts.map((product, index) => (
            <motion.div
              key={product.id}
              className="min-w-[280px] md:min-w-[320px] snap-start"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
