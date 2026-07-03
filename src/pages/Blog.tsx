import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

export default function Blog() {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('published_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="font-display text-5xl md:text-6xl mb-4">เรื่องเล่าจากครัวขนม</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            สูตรลับ วัตถุดิบไทย และเรื่องราวขนมโบราณจากทีม Khanom House
          </p>
        </div>

        {isLoading ? (
          <p className="text-center text-muted-foreground">กำลังโหลด...</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-muted-foreground">ยังไม่มีบทความ กลับมาใหม่เร็วๆ นี้ ✨</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={`/blog/${post.slug}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-all h-full">
                    {post.cover_image && (
                      <div className="aspect-video overflow-hidden bg-muted">
                        <img
                          src={post.cover_image}
                          alt={post.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                    )}
                    <CardContent className="p-6">
                      <h2 className="font-display text-2xl mb-2 line-clamp-2">{post.title}</h2>
                      {post.excerpt && (
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {post.published_at
                          ? new Date(post.published_at).toLocaleDateString('th-TH', {
                              year: 'numeric', month: 'long', day: 'numeric',
                            })
                          : ''}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
