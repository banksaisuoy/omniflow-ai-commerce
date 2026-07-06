import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Download, FileSpreadsheet, Cloud, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type Dataset = 'orders' | 'order_items' | 'products' | 'inventory' | 'pos_transactions';

const DATASETS: { key: Dataset; label: string; desc: string }[] = [
  { key: 'orders', label: 'คำสั่งซื้อ', desc: 'รายการออเดอร์ทั้งหมด (รายได้/ภาษี)' },
  { key: 'order_items', label: 'รายการสินค้าในออเดอร์', desc: 'สำหรับวิเคราะห์ยอดขายรายสินค้า' },
  { key: 'products', label: 'แคตตาล็อกสินค้า', desc: 'สินค้าและราคา' },
  { key: 'inventory', label: 'สต๊อกสินค้า', desc: 'ปริมาณคงเหลือแยกตาม SKU' },
  { key: 'pos_transactions', label: 'บิล POS หน้าร้าน', desc: 'รายการขายจากหน้าร้าน' },
];

function toCSV(rows: any[]): string {
  if (!rows.length) return '';
  const cols = Array.from(rows.reduce<Set<string>>((s, r) => {
    Object.keys(r).forEach((k) => s.add(k));
    return s;
  }, new Set()));
  const esc = (v: any) => {
    if (v === null || v === undefined) return '';
    const s = typeof v === 'object' ? JSON.stringify(v) : String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };
  return [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n');
}

export default function AdminAccounting() {
  const [loading, setLoading] = useState<Dataset | null>(null);
  const [uploading, setUploading] = useState<Dataset | null>(null);

  const download = async (ds: Dataset) => {
    setLoading(ds);
    try {
      const { data, error } = await supabase.from(ds as any).select('*').limit(10000);
      if (error) throw error;
      const csv = toCSV(data || []);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${ds}-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`ดาวน์โหลด ${ds}.csv สำเร็จ`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(null);
    }
  };

  const uploadToDrive = async (ds: Dataset) => {
    setUploading(ds);
    try {
      const { data, error } = await supabase.functions.invoke('gdrive-backup', {
        body: { tables: [ds], format: 'csv' },
      });
      if (error) throw error;
      toast.success(`อัปโหลด ${ds}.csv ขึ้น Google Drive แล้ว`);
    } catch (e: any) {
      toast.error(e.message || 'อัปโหลดไม่สำเร็จ');
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Accounting Export</h1>
        <p className="text-muted-foreground mt-1">ส่งออกข้อมูลบัญชี/ภาษี เป็น CSV หรือ Sync ขึ้น Google Drive</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {DATASETS.map((d) => (
          <Card key={d.key} className="glass border-border/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileSpreadsheet className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{d.label}</CardTitle>
                  <CardDescription>{d.desc}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button
                variant="outline"
                className="gap-2 flex-1"
                onClick={() => download(d.key)}
                disabled={loading === d.key}
              >
                {loading === d.key ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                ดาวน์โหลด CSV
              </Button>
              <Button
                className="gap-2 flex-1"
                onClick={() => uploadToDrive(d.key)}
                disabled={uploading === d.key}
              >
                {uploading === d.key ? <Loader2 className="h-4 w-4 animate-spin" /> : <Cloud className="h-4 w-4" />}
                Sync GDrive
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
