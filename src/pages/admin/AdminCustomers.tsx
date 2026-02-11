import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function AdminCustomers() {
  const [search, setSearch] = useState('');

  const { data: customers, isLoading } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'customer')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: orderCounts } = useQuery({
    queryKey: ['customer-order-counts'],
    queryFn: async () => {
      const { data, error } = await supabase.from('orders').select('customer_id, total');
      if (error) throw error;
      const counts: Record<string, { orders: number; spent: number }> = {};
      data?.forEach(o => {
        if (!o.customer_id) return;
        if (!counts[o.customer_id]) counts[o.customer_id] = { orders: 0, spent: 0 };
        counts[o.customer_id].orders++;
        counts[o.customer_id].spent += o.total;
      });
      return counts;
    },
  });

  const filtered = customers?.filter(c =>
    c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text">ลูกค้า</h1>
        <p className="text-muted-foreground mt-1">จัดการข้อมูลลูกค้า</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10"><Users className="h-5 w-5 text-primary" /></div>
              <div>
                <div className="text-2xl font-bold">{customers?.length || 0}</div>
                <div className="text-sm text-muted-foreground">ลูกค้าทั้งหมด</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass border-border/50">
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="ค้นหาลูกค้า..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">กำลังโหลด...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ลูกค้า</TableHead>
                  <TableHead>อีเมล</TableHead>
                  <TableHead>ออเดอร์</TableHead>
                  <TableHead>ยอดใช้จ่าย</TableHead>
                  <TableHead>สมัครเมื่อ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered?.map(customer => {
                  const stats = orderCounts?.[customer.id];
                  return (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={customer.avatar_url || ''} />
                            <AvatarFallback>{customer.full_name?.[0] || '?'}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{customer.full_name || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{customer.email || '-'}</TableCell>
                      <TableCell><Badge variant="secondary">{stats?.orders || 0}</Badge></TableCell>
                      <TableCell>฿{(stats?.spent || 0).toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(customer.created_at).toLocaleDateString('th-TH')}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {(!filtered || filtered.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">ไม่พบลูกค้า</TableCell>
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
