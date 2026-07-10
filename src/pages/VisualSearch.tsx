import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Sparkles, Loader2, Camera } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface Match {
  id: string;
  name: string;
  description: string;
  price: number;
  thumbnail_url: string;
  similarity: number;
}

export default function VisualSearch() {
  const [preview, setPreview] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5_000_000) {
      toast.error('ไฟล์ใหญ่เกิน 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      setLoading(true);
      setDescription('');
      setMatches([]);
      try {
        const { data, error } = await supabase.functions.invoke('visual-search', {
          body: { imageBase64: dataUrl },
        });
        if (error) throw error;
        setDescription(data.description ?? '');
        setMatches(data.matches ?? []);
        if (!data.matches?.length) toast.info('ไม่พบสินค้าที่ใกล้เคียง');
      } catch (err: any) {
        toast.error(err.message ?? 'ค้นหาไม่สำเร็จ');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display gradient-text flex items-center gap-2">
            <Sparkles className="h-7 w-7" /> ค้นหาด้วยรูปภาพ
          </h1>
          <p className="text-muted-foreground mt-2">อัปโหลดรูปขนม/ของหวาน แล้ว AI จะแนะนำสินค้าใกล้เคียงในร้าน</p>
        </div>

        <Card className="glass border-border/50 p-6">
          <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-border rounded-2xl p-10 cursor-pointer hover:border-primary transition">
            {preview ? (
              <img src={preview} alt="preview" className="max-h-64 rounded-xl object-cover" />
            ) : (
              <>
                <Camera className="h-10 w-10 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">ลากรูปมาวางหรือคลิกเพื่อเลือกไฟล์</div>
              </>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={onFile} />
            <Button type="button" variant="outline" className="mt-2 pointer-events-none">
              <Upload className="mr-2 h-4 w-4" /> เลือกรูป
            </Button>
          </label>

          {loading && (
            <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> กำลังวิเคราะห์รูปด้วย AI…
            </div>
          )}
          {description && !loading && (
            <div className="mt-6 rounded-xl bg-muted/40 p-4 text-sm">
              <div className="font-medium mb-1">AI เห็นอะไรในรูปนี้:</div>
              <div className="text-muted-foreground">{description}</div>
            </div>
          )}
        </Card>

        {matches.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">สินค้าที่ใกล้เคียง</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {matches.map((m) => (
                <Link key={m.id} to={`/product/${m.id}`} className="group">
                  <Card className="overflow-hidden glass border-border/50 hover:border-primary/40 transition">
                    <div className="aspect-square bg-muted overflow-hidden">
                      {m.thumbnail_url && (
                        <img src={m.thumbnail_url} alt={m.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                      )}
                    </div>
                    <div className="p-3">
                      <div className="font-medium text-sm line-clamp-1">{m.name}</div>
                      <div className="flex items-center justify-between mt-1">
                        <div className="text-primary font-semibold">฿{m.price.toLocaleString()}</div>
                        <div className="text-[10px] text-muted-foreground">match {(m.similarity * 100).toFixed(0)}%</div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
