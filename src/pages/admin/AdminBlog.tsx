import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, FileText, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^\w\u0E00-\u0E7F]+/g, '-').replace(/^-|-$/g, '');

export default function AdminBlog() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    title: '', excerpt: '', content: '', cover_image: '',
  });

  const { data: posts = [] } = useQuery({
    queryKey: ['admin-blog-posts'],
    queryFn: async () => {
      const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
      return data ?? [];
    },
  });

  const createMut = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('blog_posts').insert({
        ...form,
        slug: slugify(form.title) + '-' + Date.now().toString(36),
        author_id: user?.id,
        published: false,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('บันทึกร่างแล้ว');
      setForm({ title: '', excerpt: '', content: '', cover_image: '' });
      qc.invalidateQueries({ queryKey: ['admin-blog-posts'] });
    },
  });

  const togglePub = useMutation({
    mutationFn: async (p: any) => {
      const { error } = await supabase.from('blog_posts').update({
        published: !p.published,
        published_at: !p.published ? new Date().toISOString() : p.published_at,
      }).eq('id', p.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-blog-posts'] }),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('blog_posts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-blog-posts'] }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="h-7 w-7 text-primary" />บทความ / บล็อก
        </h1>
        <p className="text-muted-foreground">เขียนเรื่องเล่าและสูตรลับ Khanom House</p>
      </div>

      <Card>
        <CardHeader><CardTitle>เขียนบทความใหม่</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>หัวข้อ</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <Label>ภาพหน้าปก (URL)</Label>
            <Input value={form.cover_image} onChange={(e) => setForm({ ...form, cover_image: e.target.value })} />
          </div>
          <div>
            <Label>เกริ่นนำ</Label>
            <Textarea rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
          </div>
          <div>
            <Label>เนื้อหา (HTML)</Label>
            <Textarea rows={10} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          </div>
          <Button onClick={() => createMut.mutate()} disabled={!form.title || !form.content}>
            <Plus className="h-4 w-4 mr-2" />บันทึกร่าง
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>บทความทั้งหมด ({posts.length})</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {posts.map((p: any) => (
            <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <p className="font-medium">{p.title}</p>
                <p className="text-xs text-muted-foreground">/{p.slug}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={p.published ? 'default' : 'secondary'}>
                  {p.published ? 'เผยแพร่' : 'ร่าง'}
                </Badge>
                <Button size="icon" variant="ghost" onClick={() => togglePub.mutate(p)}>
                  {p.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button size="icon" variant="ghost" onClick={() => deleteMut.mutate(p.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
          {posts.length === 0 && <p className="text-sm text-muted-foreground">ยังไม่มีบทความ</p>}
        </CardContent>
      </Card>
    </div>
  );
}
