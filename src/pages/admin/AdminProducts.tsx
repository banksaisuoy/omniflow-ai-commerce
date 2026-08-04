import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, Plus, Edit, Trash2, Package } from 'lucide-react';
import { toast } from 'sonner';
import { PRODUCT_PUBLIC_FIELDS } from '@/lib/productFields';

export default function AdminProducts() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editProduct, setEditProduct] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products', statusFilter],
    queryFn: async () => {
      let query = supabase.from('products').select(PRODUCT_PUBLIC_FIELDS).order('created_at', { ascending: false });
      if (statusFilter !== 'all') query = query.eq('status', statusFilter);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('ลบสินค้าแล้ว');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (product: any) => {
      const { error } = await supabase.from('products').update({
        name: product.name,
        price: product.price,
        status: product.status,
        category: product.category,
        description: product.description,
      }).eq('id', product.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setIsDialogOpen(false);
      toast.success('อัปเดตสินค้าแล้ว');
    },
  });

  const filtered = products?.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const statusBadge = (status: string) => {
    const map: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      draft: 'secondary',
      archived: 'destructive',
    };
    return <Badge variant={map[status] || 'outline'}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">จัดการสินค้า</h1>
          <p className="text-muted-foreground mt-1">จัดการสินค้าทั้งหมดในร้าน</p>
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] bg-background/80 border-border/50 focus:border-primary/50 transition-all shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">กำลังโหลด...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>สินค้า</TableHead>
                  <TableHead>ราคา</TableHead>
                  <TableHead>หมวดหมู่</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered?.map(product => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {product.thumbnail_url ? (
                          <img src={product.thumbnail_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>฿{product.price.toLocaleString()}</TableCell>
                    <TableCell>{product.category || '-'}</TableCell>
                    <TableCell>{statusBadge(product.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => { setEditProduct({ ...product }); setIsDialogOpen(true); }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => deleteMutation.mutate(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(!filtered || filtered.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      ไม่พบสินค้า
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไขสินค้า</DialogTitle>
          </DialogHeader>
          {editProduct && (
            <div className="space-y-4">
              <div>
                <Label>ชื่อสินค้า</Label>
                <Input value={editProduct.name} onChange={e => setEditProduct({ ...editProduct, name: e.target.value })} />
              </div>
              <div>
                <Label>ราคา</Label>
                <Input type="number" value={editProduct.price} onChange={e => setEditProduct({ ...editProduct, price: parseFloat(e.target.value) })} />
              </div>
              <div>
                <Label>หมวดหมู่</Label>
                <Input value={editProduct.category || ''} onChange={e => setEditProduct({ ...editProduct, category: e.target.value })} />
              </div>
              <div>
                <Label>สถานะ</Label>
                <Select value={editProduct.status} onValueChange={v => setEditProduct({ ...editProduct, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>รายละเอียด</Label>
                <Textarea value={editProduct.description || ''} onChange={e => setEditProduct({ ...editProduct, description: e.target.value })} />
              </div>
              <Button className="w-full" onClick={() => updateMutation.mutate(editProduct)}>
                บันทึก
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
