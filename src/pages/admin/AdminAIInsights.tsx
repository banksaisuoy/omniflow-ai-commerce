import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AIForecastPanel } from '@/components/admin/AIForecastPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, Package, Star } from 'lucide-react';

export default function AdminAIInsights() {
  const { data: salesData } = useQuery({
    queryKey: ['ai-insights-sales'],
    queryFn: async () => {
      const now = new Date();
      // Get a safe boundary for the last 30 days starting at midnight
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      thirtyDaysAgo.setHours(0, 0, 0, 0);
      const { data: orders } = await supabase.from('orders').select('*').gte('created_at', thirtyDaysAgo.toISOString());
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
      return Object.entries(salesByDay).map(([date, d]) => ({
        date, revenue: d.revenue, orders: d.orders,
        displayDate: new Date(date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }),
      }));
    },
  });

  const { data: reviewStats } = useQuery({
    queryKey: ['ai-review-stats'],
    queryFn: async () => {
      const { data } = await supabase.from('reviews').select('ai_sentiment, rating');
      const positive = data?.filter(r => r.ai_sentiment === 'positive').length || 0;
      const negative = data?.filter(r => r.ai_sentiment === 'negative').length || 0;
      const neutral = data?.filter(r => r.ai_sentiment === 'neutral').length || 0;
      const avgRating = data?.length ? data.reduce((s, r) => s + r.rating, 0) / data.length : 0;
      return { positive, negative, neutral, total: data?.length || 0, avgRating };
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text">AI Insights</h1>
        <p className="text-muted-foreground mt-1">การวิเคราะห์และพยากรณ์ด้วย AI</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10"><Brain className="h-5 w-5 text-primary" /></div>
              <div>
                <div className="text-2xl font-bold">{reviewStats?.total || 0}</div>
                <div className="text-sm text-muted-foreground">รีวิวทั้งหมด</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10"><TrendingUp className="h-5 w-5 text-success" /></div>
              <div>
                <div className="text-2xl font-bold">{reviewStats?.positive || 0}</div>
                <div className="text-sm text-muted-foreground">Positive</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10"><Package className="h-5 w-5 text-destructive" /></div>
              <div>
                <div className="text-2xl font-bold">{reviewStats?.negative || 0}</div>
                <div className="text-sm text-muted-foreground">Negative</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10"><Star className="h-5 w-5 text-warning" /></div>
              <div>
                <div className="text-2xl font-bold">{reviewStats?.avgRating?.toFixed(1) || '0'}</div>
                <div className="text-sm text-muted-foreground">คะแนนเฉลี่ย</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AIForecastPanel salesData={salesData || []} />
    </div>
  );
}
