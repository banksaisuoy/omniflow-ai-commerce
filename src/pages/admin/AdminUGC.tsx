import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Images, Check, X, Loader2 } from 'lucide-react';

interface Post {
  id: string;
  image_url: string;
  caption: string | null;
  status: string;
  created_at: string;
  user_id: string | null;
  product_id: string | null;
}

export default function AdminUGC() {
  const [rows, setRows] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('ugc_posts' as any).select('*').order('created_at', { ascending: false });
    if (error) toast.error(error.message);
    setRows((data ?? []) as any);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const moderate = async (id: string, status: 'approved' | 'rejected') => {
    const { error } = await supabase.from('ugc_posts' as any).update({ status }).eq('id', id);
    if (error) return toast.error(error.message);
    toast.success(status === 'approved' ? 'อนุมัติแล้ว' : 'ปฏิเสธแล้ว');
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text flex items-center gap-2"><Images className="h-7 w-7" /> UGC Gallery</h1>
        <p className="text-muted-foreground mt-1">ตรวจสอบและอนุมัติภาพจากลูกค้า</p>
      </div>

      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {rows.map(p => (
            <Card key={p.id} className="glass border-border/50 overflow-hidden">
              <div className="aspect-square bg-muted">
                <img src={p.image_url} alt={p.caption ?? ''} className="w-full h-full object-cover" />
              </div>
              <CardContent className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant={p.status === 'approved' ? 'secondary' : p.status === 'rejected' ? 'destructive' : 'outline'}>{p.status}</Badge>
                  <span className="text-[10px] text-muted-foreground">{new Date(p.created_at).toLocaleDateString('th-TH')}</span>
                </div>
                {p.caption && <p className="text-xs line-clamp-2">{p.caption}</p>}
                <div className="flex gap-2 pt-1">
                  <Button size="sm" className="flex-1" onClick={() => moderate(p.id, 'approved')}><Check className="h-3 w-3 mr-1" /> อนุมัติ</Button>
                  <Button size="sm" variant="outline" onClick={() => moderate(p.id, 'rejected')}><X className="h-3 w-3" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {!rows.length && <div className="text-sm text-muted-foreground col-span-full">ยังไม่มีโพสต์จากลูกค้า</div>}
        </div>
      )}
    </div>
  );
}
