import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Package, AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminInventory() {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: inventoryItems, isLoading } = useQuery({
    queryKey: ['admin-inventory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory')
        .select(`
          *,
          product:products (
            id,
            name,
            thumbnail_url,
            category
          )
        `)
        .order('quantity', { ascending: true });
        
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('inventory-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inventory' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const filtered = inventoryItems?.filter((item: unknown) => {
    const i = item as { product?: { name?: string } };
    return i.product?.name?.toLowerCase().includes(search.toLowerCase());
  });

  const getStatusBadge = (quantity: number, reorderPoint: number | null) => {
    const threshold = reorderPoint || 10;
    if (quantity === 0) {
      return <Badge variant="destructive" className="gap-1"><AlertTriangle className="w-3 h-3"/> สินค้าหมด</Badge>;
    }
    if (quantity <= threshold) {
      return <Badge variant="secondary" className="gap-1 text-warning"><AlertTriangle className="w-3 h-3"/> ใกล้หมด</Badge>;
    }
    return <Badge variant="default" className="bg-success/20 text-success hover:bg-success/30">ปกติ</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">สถานะคลังสินค้า</h1>
          <p className="text-muted-foreground mt-1">ตรวจสอบและจัดการสต๊อกสินค้าแบบเรียลไทม์</p>
        </div>
      </div>

      <Card className="glass border-border/50">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-4 bg-background/50 p-4 rounded-xl border border-border/50 shadow-sm backdrop-blur-md transition-all">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="ค้นหาสินค้า..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 bg-background/80 border-border/50 focus:border-primary/50 transition-all shadow-none"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground gap-3">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>กำลังโหลดข้อมูลคลังสินค้า...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>สินค้า</TableHead>
                  <TableHead className="text-right">คงเหลือ</TableHead>
                  <TableHead className="text-right">จองแล้ว</TableHead>
                  <TableHead className="text-right">จุดสั่งซื้อ (Reorder)</TableHead>
                  <TableHead className="text-center">สถานะ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered?.map((item: unknown) => {
                  const i = item as { 
                    id: string; 
                    quantity: number; 
                    reserved_quantity: number; 
                    reorder_point: number | null;
                    product?: { name?: string; thumbnail_url?: string; category?: string; };
                  };
                  return (
                  <TableRow key={i.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {i.product?.thumbnail_url ? (
                          <img src={i.product.thumbnail_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{i.product?.name || 'Unknown Product'}</div>
                          <div className="text-xs text-muted-foreground">{i.product?.category || '-'}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">{i.quantity}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{i.reserved_quantity || 0}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{i.reorder_point || 10}</TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(i.quantity, i.reorder_point)}
                    </TableCell>
                  </TableRow>
                )})}
                {(!filtered || filtered.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
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
