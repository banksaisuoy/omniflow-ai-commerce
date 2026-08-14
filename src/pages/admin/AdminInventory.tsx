import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Package, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminInventory() {
  const queryClient = useQueryClient();

  const { data: inventoryData, isLoading } = useQuery({
    queryKey: ['admin-inventory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory')
        .select(`
          *,
          product:product_id (
            name,
            category
          )
        `)
        .order('quantity', { ascending: true });

      if (error) {
        toast.error('Failed to fetch inventory data');
        throw error;
      }
      return data;
    },
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
    toast.success('อัปเดตข้อมูลสำเร็จ');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">สต๊อกและคลังสินค้า</h1>
          <p className="text-muted-foreground mt-1">
            จัดการและตรวจสอบสต๊อกสินค้าทั้งหมด
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          รีเฟรชข้อมูล
        </Button>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="h-5 w-5 text-primary" />
            รายการสินค้าคงคลัง
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-md border border-border/50 overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>สินค้า</TableHead>
                    <TableHead>หมวดหมู่</TableHead>
                    <TableHead className="text-right">จำนวนคงเหลือ</TableHead>
                    <TableHead className="text-right">จุดสั่งซื้อ (Reorder Point)</TableHead>
                    <TableHead className="text-center">สถานะ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryData?.map((item) => {
                    const productInfo = item.product as unknown as { name: string; category: string } | null;
                    const isLowStock = item.quantity <= (item.reorder_point || 0);
                    
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {productInfo?.name || 'ไม่ระบุชื่อสินค้า'}
                        </TableCell>
                        <TableCell>{productInfo?.category || '-'}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {item.reorder_point || 0}
                        </TableCell>
                        <TableCell className="text-center">
                          {isLowStock ? (
                            <Badge variant="destructive" className="gap-1.5">
                              <AlertTriangle className="h-3 w-3" />
                              ใกล้หมด
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                              ปกติ
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {(!inventoryData || inventoryData.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        ไม่พบข้อมูลสินค้าคงคลัง
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
