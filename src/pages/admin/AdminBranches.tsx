import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Building2, Plus, Loader2 } from 'lucide-react';

interface Branch {
  id: string;
  name: string;
  code: string;
  address: string | null;
  phone: string | null;
  active: boolean;
}

export default function AdminBranches() {
  const [rows, setRows] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', code: '', address: '', phone: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('branches' as any).select('*').order('created_at', { ascending: false });
    if (error) toast.error(error.message);
    setRows((data ?? []) as any);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.name || !form.code) return toast.error('กรอกชื่อและรหัสสาขา');
    setSaving(true);
    const { error } = await supabase.from('branches' as any).insert(form as any);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success('สร้างสาขาสำเร็จ');
    setForm({ name: '', code: '', address: '', phone: '' });
    load();
  };

  const toggle = async (b: Branch) => {
    const { error } = await supabase.from('branches' as any).update({ active: !b.active }).eq('id', b.id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text flex items-center gap-2"><Building2 className="h-7 w-7" /> สาขา (Multi-Branch)</h1>
        <p className="text-muted-foreground mt-1">จัดการสาขาและสต๊อกรายสาขา</p>
      </div>

      <Card className="glass border-border/50">
        <CardHeader><CardTitle>เพิ่มสาขาใหม่</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-5">
          <Input placeholder="ชื่อสาขา" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="รหัส (เช่น BKK01)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
          <Input placeholder="ที่อยู่" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <Input placeholder="เบอร์โทร" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Button onClick={create} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4 mr-2" /> เพิ่ม</>}
          </Button>
        </CardContent>
      </Card>

      <Card className="glass border-border/50">
        <CardHeader><CardTitle>รายการสาขา</CardTitle></CardHeader>
        <CardContent>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
            <div className="space-y-2">
              {rows.map((b) => (
                <div key={b.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                  <div>
                    <div className="font-medium">{b.name} <span className="text-xs text-muted-foreground ml-2">{b.code}</span></div>
                    <div className="text-xs text-muted-foreground">{b.address} {b.phone && `· ${b.phone}`}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={b.active ? 'secondary' : 'outline'}>{b.active ? 'เปิด' : 'ปิด'}</Badge>
                    <Button size="sm" variant="ghost" onClick={() => toggle(b)}>{b.active ? 'ปิด' : 'เปิด'}</Button>
                  </div>
                </div>
              ))}
              {!rows.length && <div className="text-sm text-muted-foreground">ยังไม่มีสาขา</div>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
