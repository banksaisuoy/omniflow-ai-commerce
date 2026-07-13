import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function AdminCoupons() {
  const qc = useQueryClient();
  const [form, setForm] = useState<any>({
    code: '', description: '', discount_type: 'percent', discount_value: 10, min_order: 0,
    bogo_buy_qty: null, bogo_get_qty: null, bogo_get_discount_percent: null, tier_thresholds: '',
  });

  const { data: coupons = [] } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: async () => {
      const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
      return data ?? [];
    },
  });

  const createMut = useMutation({
    mutationFn: async () => {
      let tiers: any = null;
      if (form.tier_thresholds?.trim()) {
        try { tiers = JSON.parse(form.tier_thresholds); } catch { throw new Error('tier_thresholds ต้องเป็น JSON'); }
      }
      const payload: any = {
        code: form.code.toUpperCase().trim(),
        description: form.description,
        discount_type: form.discount_type,
        discount_value: form.discount_value,
        min_order: form.min_order,
        bogo_buy_qty: form.bogo_buy_qty || null,
        bogo_get_qty: form.bogo_get_qty || null,
        bogo_get_discount_percent: form.bogo_get_discount_percent || null,
        tier_thresholds: tiers,
      };
      const { error } = await supabase.from('coupons').insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('สร้างคูปองสำเร็จ');
      setForm({ code: '', description: '', discount_type: 'percent', discount_value: 10, min_order: 0, bogo_buy_qty: null, bogo_get_qty: null, bogo_get_discount_percent: null, tier_thresholds: '' });
      qc.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const toggleMut = useMutation({
    mutationFn: async (c: any) => {
      const { error } = await supabase.from('coupons').update({ active: !c.active }).eq('id', c.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-coupons'] }),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('coupons').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('ลบแล้ว');
      qc.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Tag className="h-7 w-7 text-primary" />คูปองส่วนลด
        </h1>
        <p className="text-muted-foreground">จัดการโค้ดส่วนลดสำหรับหน้าชำระเงิน</p>
      </div>

      <Card>
        <CardHeader><CardTitle>สร้างคูปองใหม่</CardTitle></CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-5 gap-3">
            <div>
              <Label>โค้ด</Label>
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="SUMMER20" />
            </div>
            <div>
              <Label>คำอธิบาย</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <Label>ประเภท</Label>
              <Select value={form.discount_type} onValueChange={(v) => setForm({ ...form, discount_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">% เปอร์เซ็นต์</SelectItem>
                  <SelectItem value="fixed">฿ บาท</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>มูลค่า</Label>
              <Input type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: +e.target.value })} />
            </div>
            <div>
              <Label>ยอดขั้นต่ำ</Label>
              <Input type="number" value={form.min_order} onChange={(e) => setForm({ ...form, min_order: +e.target.value })} />
            </div>
          </div>
          <div className="mt-4 p-4 rounded-lg border border-border/50 bg-muted/20 space-y-3">
            <div className="text-sm font-medium">โปรโมชั่นขั้นสูง (ตัวเลือก)</div>
            <div className="grid md:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">BOGO: ซื้อจำนวน</Label>
                <Input type="number" placeholder="เช่น 2" value={form.bogo_buy_qty ?? ''} onChange={(e) => setForm({ ...form, bogo_buy_qty: e.target.value ? +e.target.value : null })} />
              </div>
              <div>
                <Label className="text-xs">BOGO: แถมจำนวน</Label>
                <Input type="number" placeholder="เช่น 1" value={form.bogo_get_qty ?? ''} onChange={(e) => setForm({ ...form, bogo_get_qty: e.target.value ? +e.target.value : null })} />
              </div>
              <div>
                <Label className="text-xs">BOGO: ส่วนลดชิ้นแถม %</Label>
                <Input type="number" placeholder="100 = ฟรี" value={form.bogo_get_discount_percent ?? ''} onChange={(e) => setForm({ ...form, bogo_get_discount_percent: e.target.value ? +e.target.value : null })} />
              </div>
            </div>
            <div>
              <Label className="text-xs">Tier ส่วนลด (JSON)</Label>
              <Input placeholder='[{"min":500,"discount":50},{"min":1000,"discount":150}]' value={form.tier_thresholds} onChange={(e) => setForm({ ...form, tier_thresholds: e.target.value })} />
            </div>
          </div>
          <Button className="mt-4" onClick={() => createMut.mutate()} disabled={!form.code || createMut.isPending}>
            <Plus className="h-4 w-4 mr-2" />สร้างคูปอง
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>คูปองทั้งหมด ({coupons.length})</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>โค้ด</TableHead>
                <TableHead>ส่วนลด</TableHead>
                <TableHead>ขั้นต่ำ</TableHead>
                <TableHead>ใช้ไปแล้ว</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((c: any) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono font-bold">{c.code}</TableCell>
                  <TableCell>
                    {c.discount_type === 'percent' ? `${c.discount_value}%` : `฿${c.discount_value}`}
                    {c.description && <p className="text-xs text-muted-foreground">{c.description}</p>}
                  </TableCell>
                  <TableCell>฿{c.min_order}</TableCell>
                  <TableCell>{c.used_count}{c.max_uses ? `/${c.max_uses}` : ''}</TableCell>
                  <TableCell>
                    <Badge
                      variant={c.active ? 'default' : 'secondary'}
                      className="cursor-pointer"
                      onClick={() => toggleMut.mutate(c)}
                    >
                      {c.active ? 'ใช้งาน' : 'ปิด'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="icon" variant="ghost" onClick={() => deleteMut.mutate(c.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
