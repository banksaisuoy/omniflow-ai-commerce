import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Truck, CheckCircle, Clock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OrderTracking() {
  const { orderId } = useParams<{ orderId: string }>();

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!orderId) throw new Error('Order ID is required');
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', orderId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!orderId,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">กำลังโหลดข้อมูลคำสั่งซื้อ...</p>
        </div>
      </Layout>
    );
  }

  if (error || !order) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">ไม่พบข้อมูลคำสั่งซื้อ</h2>
          <p className="text-muted-foreground mb-8">รหัสคำสั่งซื้ออาจไม่ถูกต้อง หรือไม่มีอยู่ในระบบ</p>
          <Button asChild>
            <Link to="/">กลับหน้าแรก</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const statuses = [
    { id: 'pending', label: 'รอชำระเงิน/กำลังตรวจสอบ', icon: Clock },
    { id: 'processing', label: 'กำลังเตรียมสินค้า', icon: Package },
    { id: 'shipped', label: 'จัดส่งแล้ว', icon: Truck }, // Adding an implicit shipped status for visual tracking
    { id: 'completed', label: 'สำเร็จ', icon: CheckCircle },
  ];

  const getStatusIndex = (status: string) => {
    switch (status) {
      case 'pending': return 0;
      case 'processing': return 1;
      case 'shipped': return 2;
      case 'completed': return 3;
      case 'cancelled': return -1;
      default: return 0;
    }
  };

  const currentIndex = getStatusIndex(order.status);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button variant="ghost" asChild className="mb-6 -ml-4">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            กลับหน้าแรก
          </Link>
        </Button>

        <h1 className="text-3xl font-bold mb-2">ติดตามสถานะคำสั่งซื้อ</h1>
        <p className="text-muted-foreground mb-8">
          หมายเลขคำสั่งซื้อ: <span className="font-mono font-medium text-foreground">{order.order_number}</span>
        </p>

        {order.status === 'cancelled' ? (
          <Card className="mb-8 border-destructive/50 bg-destructive/5">
            <CardContent className="p-6 text-center text-destructive">
              <h2 className="text-xl font-bold mb-2">คำสั่งซื้อถูกยกเลิก</h2>
              <p>หากมีข้อสงสัย กรุณาติดต่อเรา</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>สถานะการจัดส่ง</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center py-4">
                {/* Connecting line */}
                <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-border md:w-full md:h-0.5 md:left-0 md:top-1/2 md:-translate-y-1/2 z-0" />
                <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-primary transition-all duration-500 md:w-full md:h-0.5 md:left-0 md:top-1/2 md:-translate-y-1/2 z-0"
                     style={{
                       height: 'auto',
                       width: currentIndex >= 0 ? `${(currentIndex / (statuses.length - 1)) * 100}%` : '0%'
                     }}
                />

                {statuses.map((s, index) => {
                  const isActive = index <= currentIndex;
                  const isCurrent = index === currentIndex;
                  const Icon = s.icon;
                  return (
                    <div key={s.id} className="relative z-10 flex md:flex-col items-center gap-4 md:gap-2 mb-8 md:mb-0 w-full md:w-auto">
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 border-4 ${
                        isActive
                          ? 'bg-primary border-background text-primary-foreground'
                          : 'bg-muted border-background text-muted-foreground'
                      } ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="text-left md:text-center">
                        <p className={`font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {s.label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลการจัดส่ง</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">ชื่อผู้รับ</p>
                <p className="font-medium">{order.shipping_address?.name || order.customer_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">เบอร์โทรศัพท์</p>
                <p className="font-medium">{order.shipping_address?.phone || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">ที่อยู่จัดส่ง</p>
                <p className="font-medium whitespace-pre-wrap">{order.shipping_address?.address || '-'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>รายการสินค้า</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                {order.order_items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      {item.product_image && (
                        <div className="w-12 h-12 rounded bg-muted shrink-0 overflow-hidden">
                          <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm line-clamp-1">{item.product_name}</p>
                        <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-medium text-sm whitespace-nowrap">
                      ฿{item.total_price.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-border space-y-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>ยอดรวมทั้งสิ้น</span>
                  <span className="text-primary">฿{(order.total || 0).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
