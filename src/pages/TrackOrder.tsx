import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Package, CheckCircle2, Clock, Truck, Home } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const STATUS_STEPS = [
  { key: 'pending', label: 'รับคำสั่งซื้อ', icon: Clock },
  { key: 'confirmed', label: 'ยืนยันคำสั่งซื้อ', icon: CheckCircle2 },
  { key: 'preparing', label: 'เตรียมขนม', icon: Package },
  { key: 'shipped', label: 'จัดส่งแล้ว', icon: Truck },
  { key: 'delivered', label: 'ส่งถึงมือ', icon: Home },
];

export default function TrackOrder() {
  const [params, setParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(params.get('order') || '');
  const [order, setOrder] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const track = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!orderNumber.trim()) return;
    setLoading(true);
    setParams({ order: orderNumber });
    try {
      const { data: o } = await supabase
        .from('orders')
        .select('id, order_number, status, total, created_at, customer_name, shipping_address')
        .eq('order_number', orderNumber.trim())
        .maybeSingle();
      if (!o) {
        toast.error('ไม่พบคำสั่งซื้อนี้');
        setOrder(null);
        setEvents([]);
        return;
      }
      setOrder(o);
      const { data: ev } = await supabase
        .from('order_events')
        .select('*')
        .eq('order_id', o.id)
        .order('created_at', { ascending: true });
      setEvents(ev ?? []);
    } finally {
      setLoading(false);
    }
  };

  const currentStepIdx = order
    ? Math.max(0, STATUS_STEPS.findIndex((s) => s.key === order.status))
    : -1;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl md:text-5xl mb-3">ติดตามคำสั่งซื้อ</h1>
          <p className="text-muted-foreground">กรอกหมายเลขคำสั่งซื้อของคุณเพื่อเช็คสถานะ</p>
        </div>

        <form onSubmit={track} className="flex gap-2 mb-8">
          <Input
            placeholder="เช่น OMN-20250101-1234"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={loading}>
            <Search className="h-4 w-4 mr-2" />ค้นหา
          </Button>
        </form>

        {order && (
          <Card>
            <CardContent className="p-6 space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">หมายเลข</p>
                  <p className="font-mono font-bold text-lg">{order.order_number}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">ยอดรวม</p>
                  <p className="font-bold text-lg text-primary">฿{order.total?.toLocaleString()}</p>
                </div>
              </div>

              {/* Timeline */}
              <div className="relative">
                <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-border" />
                <div className="space-y-6">
                  {STATUS_STEPS.map((step, i) => {
                    const done = i <= currentStepIdx;
                    const Icon = step.icon;
                    return (
                      <motion.div
                        key={step.key}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-4 relative"
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                            done ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 pt-1.5">
                          <p className={`font-medium ${done ? '' : 'text-muted-foreground'}`}>
                            {step.label}
                          </p>
                          {i === currentStepIdx && (
                            <p className="text-xs text-primary mt-0.5">สถานะปัจจุบัน</p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {events.length > 0 && (
                <div className="pt-4 border-t">
                  <p className="font-semibold mb-3">อัปเดตล่าสุด</p>
                  <div className="space-y-2">
                    {events.slice().reverse().map((ev) => (
                      <div key={ev.id} className="flex justify-between text-sm">
                        <span>{ev.note || ev.status}</span>
                        <span className="text-muted-foreground text-xs">
                          {new Date(ev.created_at).toLocaleString('th-TH')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
