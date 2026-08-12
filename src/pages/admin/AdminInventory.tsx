import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Package, AlertTriangle } from 'lucide-react';

interface InventoryItem {
  id: string;
  quantity: number;
  low_stock_threshold: number | null;
  product: {
    id: string;
    name: string;
    sku: string | null;
    thumbnail_url: string | null;
  };
}

export default function AdminInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInventory();

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

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select(`
          id,
          quantity,
          low_stock_threshold,
          product:products(id, name, sku, thumbnail_url)
        `)
        .order('quantity', { ascending: true });

      if (error) throw error;
      
      const formattedItems = (data || []).filter(item => item.product).map(item => ({
        ...item,
        product: item.product as unknown as InventoryItem['product']
      }));
      
      setItems(formattedItems);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = items.filter(item =>
    item.product.name.toLowerCase().includes(search.toLowerCase()) ||
    (item.product.sku && item.product.sku.toLowerCase().includes(search.toLowerCase()))
  );

  const getStockStatus = (quantity: number, threshold: number | null) => {
    const t = threshold || 10;
    if (quantity <= 0) return { label: 'หมด', variant: 'destructive' as const };
    if (quantity <= t) return { label: 'ใกล้หมด', variant: 'warning' as const };
    return { label: 'ปกติ', variant: 'default' as const };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">สต๊อกสินค้า</h1>
          <p className="text-muted-foreground mt-1">ติดตามปริมาณคงเหลือแบบเรียลไทม์</p>
        </div>
      </div>

      <Card className="glass border-border/50">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-4 bg-background/50 p-4 rounded-xl border border-border/50 shadow-sm backdrop-blur-md">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="ค้นหาสินค้า หรือ SKU..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 bg-background/80 border-border/50 focus:border-primary/50 transition-all shadow-none"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">กำลังโหลดข้อมูล...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>สินค้า</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">คงเหลือ</TableHead>
                  <TableHead className="text-center">สถานะ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map(item => {
                  const status = getStockStatus(item.quantity, item.low_stock_threshold);
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-muted flex items-center justify-center overflow-hidden">
                            {item.product.thumbnail_url ? (
                              <img src={item.product.thumbnail_url} alt={item.product.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <span className="font-medium">{item.product.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{item.product.sku || '-'}</TableCell>
                      <TableCell className="text-right font-medium">{item.quantity}</TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant={status.variant}
                          className={status.variant === 'warning' ? 'bg-warning/20 text-warning hover:bg-warning/30 border-warning/50' : ''}
                        >
                          {status.variant === 'warning' || status.variant === 'destructive' ? (
                            <AlertTriangle className="w-3 h-3 mr-1 inline" />
                          ) : null}
                          {status.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      ไม่พบข้อมูลสินค้า
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
