import { ShoppingCart, RotateCcw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

// Mock past order data
const pastOrder = {
  id: 'order-123',
  date: '30 วันที่แล้ว',
  items: [
    {
      id: 'prod-1',
      name: 'ขนมชั้นใบเตย',
      price: 60,
      quantity: 2,
      thumbnail_url: 'https://images.unsplash.com/photo-1601000938259-9e92002320b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 'prod-2',
      name: 'ข้าวเหนียวมะม่วง',
      price: 120,
      quantity: 1,
      thumbnail_url: 'https://images.unsplash.com/photo-1559598467-f8b76c8155d0?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    }
  ]
};

export function SmartReorder() {
  const addItem = useCartStore((state) => state.addItem);

  const handleReorder = () => {
    pastOrder.items.forEach(item => {
      // Add each item to cart (simulating adding the correct quantity would normally require a function that supports quantity, but addItem adds 1 by default in this implementation, so we loop)
      for (let i = 0; i < item.quantity; i++) {
        addItem({
          id: item.id,
          name: item.name,
          price: item.price,
          thumbnail_url: item.thumbnail_url,
        });
      }
    });
    toast.success('เพิ่มรายการสั่งซื้อเดิมลงตะกร้าแล้ว');
  };

  const total = pastOrder.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="py-12 bg-secondary/20"
    >
      <div className="container mx-auto px-4">
        <Card className="max-w-3xl mx-auto overflow-hidden border-primary/20 shadow-elegant bg-white/60 backdrop-blur-md">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row">
              <div className="bg-gradient-warm p-6 md:p-8 flex flex-col justify-center items-start md:w-2/5">
                <div className="flex items-center gap-2 mb-3 text-primary">
                  <RotateCcw className="h-5 w-5" />
                  <span className="font-semibold uppercase tracking-wider text-xs">Smart Reorder</span>
                </div>
                <h3 className="font-display text-2xl md:text-3xl mb-2">
                  สั่งขนมชุดเดิมจาก<br /> <span className="italic">{pastOrder.date}</span> ไหม?
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  ประหยัดเวลาด้วยการสั่งซื้อรายการโปรดที่คุณเคยสั่งเมื่อเดือนที่แล้ว
                </p>
                <Button onClick={handleReorder} className="w-full rounded-full shadow-soft group">
                  <ShoppingCart className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  สั่งซื้ออีกครั้ง (฿{total})
                </Button>
              </div>

              <div className="p-6 md:p-8 flex-1 flex flex-col justify-center bg-white/40">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-sm text-foreground/80 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" /> รายการสั่งซื้อล่าสุด
                  </h4>
                  <span className="text-xs text-muted-foreground">Order #{pastOrder.id}</span>
                </div>

                <div className="space-y-4">
                  {pastOrder.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                        <img src={item.thumbnail_url} alt={item.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium text-sm">{item.name}</h5>
                        <p className="text-xs text-muted-foreground">{item.quantity} x ฿{item.price}</p>
                      </div>
                      <div className="font-medium text-sm text-primary">
                        ฿{item.price * item.quantity}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
