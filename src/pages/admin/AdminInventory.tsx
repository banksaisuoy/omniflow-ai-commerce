import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, PackageCheck, AlertTriangle } from 'lucide-react';

interface InventoryItem {
  id: string;
  product_id: string;
  quantity: number;
  low_stock_threshold: number;
  updated_at: string;
  product: {
    name: string;
    thumbnail_url: string;
  };
}

export default function AdminInventory() {
  const { user, isAdmin } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*, product:products(name, thumbnail_url)')
        .order('quantity', { ascending: true });

      if (error) {
        console.error('Error fetching inventory:', error);
        return;
      }
      setInventory(data as unknown as InventoryItem[]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      fetchInventory();
    }
  }, [user, isAdmin]);

  useEffect(() => {
    const channel = supabase
      .channel('inventory-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inventory' },
        () => {
          fetchInventory();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!user || !isAdmin) return null;

  const lowStockItems = inventory.filter((item) => item.quantity <= item.low_stock_threshold);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Real-time Inventory Sync</h1>
          <p className="text-muted-foreground mt-1">
            Monitor product inventory levels and thresholds
          </p>
        </div>
        <Button onClick={fetchInventory} variant="outline" className="gap-2">
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          รีเฟรช
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">สินค้าทั้งหมดในสต๊อก</CardTitle>
            <div className="p-2 rounded-lg bg-primary/10">
              <PackageCheck className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory.length}</div>
          </CardContent>
        </Card>
        
        <Card className="glass border-destructive/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">สินค้าใกล้หมด (Low Stock)</CardTitle>
            <div className="p-2 rounded-lg bg-destructive/10">
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{lowStockItems.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle>รายการสต๊อกสินค้า</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">สินค้า</th>
                  <th className="px-4 py-3">คงเหลือ</th>
                  <th className="px-4 py-3">Threshold</th>
                  <th className="px-4 py-3">สถานะ</th>
                  <th className="px-4 py-3 rounded-tr-lg">อัปเดตล่าสุด</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">กำลังโหลด...</td>
                  </tr>
                ) : inventory.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">ไม่พบข้อมูลสต๊อก</td>
                  </tr>
                ) : (
                  inventory.map((item) => {
                    const isLowStock = item.quantity <= item.low_stock_threshold;
                    return (
                      <tr key={item.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium flex items-center gap-3">
                          {item.product?.thumbnail_url && (
                            <img src={item.product.thumbnail_url} alt={item.product?.name} className="w-10 h-10 rounded-md object-cover" />
                          )}
                          {item.product?.name || 'Unknown Product'}
                        </td>
                        <td className={`px-4 py-3 font-bold ${isLowStock ? 'text-destructive' : ''}`}>
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{item.low_stock_threshold}</td>
                        <td className="px-4 py-3">
                          {isLowStock ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
                              <AlertTriangle className="h-3 w-3" /> ใกล้หมด
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                              <PackageCheck className="h-3 w-3" /> ปกติ
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(item.updated_at).toLocaleString('th-TH', { 
                            dateStyle: 'medium', 
                            timeStyle: 'short' 
                          })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
