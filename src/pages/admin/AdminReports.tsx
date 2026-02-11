import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SalesChart } from '@/components/admin/charts/SalesChart';
import { OrdersChart } from '@/components/admin/charts/OrdersChart';
import { CategoryChart } from '@/components/admin/charts/CategoryChart';
import { useMemo } from 'react';
import { DollarSign, ShoppingCart, TrendingUp, Package } from 'lucide-react';

export default function AdminReports() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-reports-data'],
    queryFn: async () => {
      const now = new Date();
      const { data: orders } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      const { data: products } = await supabase.from('products').select('category, price');

      const salesByDay: Record<string, { revenue: number; orders: number }> = {};
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const key = date.toISOString().split('T')[0];
        salesByDay[key] = { revenue: 0, orders: 0 };
      }
      orders?.forEach(order => {
        const date = order.created_at.split('T')[0];
        if (salesByDay[date]) {
          salesByDay[date].revenue += order.total || 0;
          salesByDay[date].orders += 1;
        }
      });

      const chartData = Object.entries(salesByDay).map(([date, d]) => ({
        date,
        revenue: d.revenue,
        orders: d.orders,
        displayDate: new Date(date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }),
      }));

      const totalRevenue = orders?.reduce((s, o) => s + (o.total || 0), 0) || 0;
      const totalOrders = orders?.length || 0;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      const categoryData: Record<string, number> = {};
      products?.forEach(p => {
        const cat = p.category || 'อื่นๆ';
        categoryData[cat] = (categoryData[cat] || 0) + 1;
      });

      return { chartData, totalRevenue, totalOrders, avgOrderValue, categoryData };
    },
  });

  const summaryCards = [
    { title: 'รายได้ทั้งหมด', value: `฿${(data?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign },
    { title: 'ออเดอร์ทั้งหมด', value: data?.totalOrders?.toString() || '0', icon: ShoppingCart },
    { title: 'ค่าเฉลี่ยออเดอร์', value: `฿${(data?.avgOrderValue || 0).toFixed(0)}`, icon: TrendingUp },
    { title: 'หมวดหมู่', value: Object.keys(data?.categoryData || {}).length.toString(), icon: Package },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text">รายงาน</h1>
        <p className="text-muted-foreground mt-1">สรุปข้อมูลการขายและสถิติ</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map(card => (
          <Card key={card.title} className="glass border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10"><card.icon className="h-5 w-5 text-primary" /></div>
                <div>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <div className="text-sm text-muted-foreground">{card.title}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SalesChart data={data?.chartData || []} isLoading={isLoading} />
        <OrdersChart data={data?.chartData || []} isLoading={isLoading} />
      </div>

      <CategoryChart 
        data={Object.entries(data?.categoryData || {}).map(([name, value], i) => ({
          name,
          value: value as number,
          color: `hsl(var(--chart-${(i % 5) + 1}))`,
        }))}
        isLoading={isLoading}
      />
    </div>
  );
}
