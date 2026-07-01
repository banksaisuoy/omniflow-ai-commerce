import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Brain,
  RefreshCw,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { SalesChart } from '@/components/admin/charts/SalesChart';
import { OrdersChart } from '@/components/admin/charts/OrdersChart';
import { CategoryChart } from '@/components/admin/charts/CategoryChart';
import { AIForecastPanel } from '@/components/admin/AIForecastPanel';
import { RecentOrdersTable } from '@/components/admin/RecentOrdersTable';
import { LowStockAlert } from '@/components/admin/LowStockAlert';
import AdminProducts from './AdminProducts';
import AdminOrders from './AdminOrders';
import AdminCustomers from './AdminCustomers';
import AdminReviews from './AdminReviews';
import AdminReports from './AdminReports';
import AdminAIInsights from './AdminAIInsights';
import AdminSettings from './AdminSettings';
import AdminUpload from './AdminUpload';
import POS from './pos/POS';
import ShiftManager from './pos/ShiftManager';
import POSTransactions from './pos/POSTransactions';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueChange: number;
  ordersChange: number;
  customersChange: number;
}

export default function AdminDashboard() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    revenueChange: 0,
    ordersChange: 0,
    customersChange: 0,
  });
  const [salesData, setSalesData] = useState<{ date: string; revenue: number; orders: number; displayDate: string; }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/auth');
    }
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchDashboardData();

      const channel = supabase
        .channel('dashboard-updates')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          () => {
            fetchDashboardData();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'order_items' },
          () => {
            fetchDashboardData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, isAdmin]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch orders
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch products
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Fetch customers
      const { count: customersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'customer');

      // Calculate stats
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      const recentOrders = orders?.filter(o => new Date(o.created_at) >= thirtyDaysAgo) || [];
      const previousOrders = orders?.filter(o => 
        new Date(o.created_at) >= sixtyDaysAgo && new Date(o.created_at) < thirtyDaysAgo
      ) || [];

      const totalRevenue = recentOrders.reduce((sum, o) => sum + (o.total || 0), 0);
      const previousRevenue = previousOrders.reduce((sum, o) => sum + (o.total || 0), 0);

      const revenueChange = previousRevenue > 0 
        ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
        : 0;

      const ordersChange = previousOrders.length > 0
        ? ((recentOrders.length - previousOrders.length) / previousOrders.length) * 100
        : 0;

      setStats({
        totalRevenue,
        totalOrders: orders?.length || 0,
        totalCustomers: customersCount || 0,
        totalProducts: productsCount || 0,
        revenueChange,
        ordersChange,
        customersChange: 12.5, // Placeholder
      });

      // Prepare sales data for charts (last 30 days)
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

      const chartData = Object.entries(salesByDay).map(([date, data]) => ({
        date,
        revenue: data.revenue,
        orders: data.orders,
        displayDate: new Date(date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }),
      }));

      setSalesData(chartData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const statCards = [
    {
      title: 'รายได้รวม',
      value: `฿${stats.totalRevenue.toLocaleString()}`,
      change: stats.revenueChange,
      icon: DollarSign,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'คำสั่งซื้อ',
      value: stats.totalOrders.toString(),
      change: stats.ordersChange,
      icon: ShoppingCart,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
    {
      title: 'ลูกค้า',
      value: stats.totalCustomers.toString(),
      change: stats.customersChange,
      icon: Users,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      title: 'สินค้า',
      value: stats.totalProducts.toString(),
      change: 0,
      icon: Package,
      color: 'text-info',
      bgColor: 'bg-info/10',
    },
  ];

  const renderSubPage = () => {
    if (currentPath === '/admin/pos') return <POS />;
    if (currentPath === '/admin/pos/shift') return <ShiftManager />;
    if (currentPath === '/admin/pos/transactions') return <POSTransactions />;
    if (currentPath === '/admin/products') return <AdminProducts />;
    if (currentPath === '/admin/upload') return <AdminUpload />;
    if (currentPath === '/admin/orders') return <AdminOrders />;
    if (currentPath === '/admin/customers') return <AdminCustomers />;
    if (currentPath === '/admin/reviews') return <AdminReviews />;
    if (currentPath === '/admin/reports') return <AdminReports />;
    if (currentPath === '/admin/ai-insights') return <AdminAIInsights />;
    if (currentPath === '/admin/settings') return <AdminSettings />;
    return null;
  };

  if (currentPath !== '/admin') {
    return <AdminLayout>{renderSubPage()}</AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              ภาพรวมธุรกิจและการวิเคราะห์ AI
            </p>
          </div>
          <Button 
            onClick={fetchDashboardData}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            รีเฟรช
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.title} className="glass border-border/50 hover:border-primary/30 transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.change !== 0 && (
                  <div className={`flex items-center text-xs mt-1 ${
                    stat.change > 0 ? 'text-success' : 'text-destructive'
                  }`}>
                    {stat.change > 0 ? (
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                    )}
                    {Math.abs(stat.change).toFixed(1)}% จากเดือนก่อน
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          <SalesChart data={salesData} isLoading={isLoading} />
          <OrdersChart data={salesData} isLoading={isLoading} />
        </div>

        {/* AI Forecast Section */}
        <AIForecastPanel salesData={salesData} />

        {/* Bottom Section */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentOrdersTable />
          </div>
          <div>
            <LowStockAlert />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
