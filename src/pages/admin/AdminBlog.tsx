import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, FileText, Eye, EyeOff } from 'lucide-react';
import { z } from 'zod';
import DOMPurify from 'dompurify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^\w\u0E00-\u0E7F]+/g, '-').replace(/^-|-$/g, '');


const blogSchema = z.object({
  title: z.string().min(3, 'หัวข้อต้องมีอย่างน้อย 3 ตัวอักษร').max(150, 'หัวข้อต้องไม่เกิน 150 ตัวอักษร'),
  excerpt: z.string().max(300, 'เกริ่นนำต้องไม่เกิน 300 ตัวอักษร').optional(),
  content: z.string().min(10, 'เนื้อหาต้องมีอย่างน้อย 10 ตัวอักษร'),
  cover_image: z.string().url('URL รูปภาพไม่ถูกต้อง').or(z.literal('')),
});

export default function AdminBlog() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const createMut = useMutation({
    mutationFn: async () => {
      try {
        blogSchema.parse(form);
      } catch (err) {
        if (err instanceof z.ZodError) {
          throw new Error(err.errors[0].message);
        }
        throw err;
      }

      const sanitizedContent = DOMPurify.sanitize(form.content);

      const { error } = await supabase.from('blog_posts').insert({
        ...form,
        content: sanitizedContent,
        slug: slugify(form.title) + '-' + Date.now().toString(36),
        author_id: user?.id,
        published: false,
      setForm({ title: '', excerpt: '', content: '', cover_image: '' });
      qc.invalidateQueries({ queryKey: ['admin-blog-posts'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const togglePub = useMutation({
