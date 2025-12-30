import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function OrderSuccess() {
  const { orderId } = useParams<{ orderId: string }>();

  const { data: order } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', orderId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!orderId,
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg mx-auto text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="h-10 w-10 text-success" />
          </motion.div>

          <h1 className="text-3xl font-bold mb-2">สั่งซื้อสำเร็จ!</h1>
          <p className="text-muted-foreground mb-6">
            ขอบคุณสำหรับการสั่งซื้อ เราจะจัดส่งสินค้าให้เร็วที่สุด
          </p>

          {order && (
            <Card className="mb-6 text-left">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Package className="h-5 w-5 text-primary" />
                  <span className="font-semibold">หมายเลขคำสั่งซื้อ</span>
                </div>
                <p className="text-2xl font-mono font-bold text-primary mb-4">
                  {order.order_number}
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">สถานะ</span>
                    <span className="font-medium">รอดำเนินการ</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ยอดรวม</span>
                    <span className="font-medium">฿{order.total?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">จำนวนสินค้า</span>
                    <span className="font-medium">{order.order_items?.length || 0} รายการ</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link to="/products">
                ช้อปปิ้งต่อ
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/">กลับหน้าแรก</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
