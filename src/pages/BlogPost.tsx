import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar } from 'lucide-react';
import DOMPurify from 'dompurify';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  return (
    <Layout>
      <article className="container mx-auto px-4 py-12 max-w-3xl">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link to="/blog"><ArrowLeft className="h-4 w-4 mr-2" />กลับไปยังบทความทั้งหมด</Link>
        </Button>

        {isLoading ? (
          <p className="text-muted-foreground">กำลังโหลด...</p>
        ) : !post ? (
          <p className="text-muted-foreground">ไม่พบบทความ</p>
        ) : (
          <>
            {post.cover_image && (
              <img
                src={post.cover_image}
                alt={post.title}
                className="w-full aspect-video object-cover rounded-2xl mb-8"
              />
            )}
            <h1 className="font-display text-4xl md:text-5xl mb-4">{post.title}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
              <Calendar className="h-4 w-4" />
              {post.published_at
                ? new Date(post.published_at).toLocaleDateString('th-TH', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })
                : ''}
            </div>
            <div
              className="prose prose-lg max-w-none prose-headings:font-display"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
            />
          </>
        )}
      </article>
    </Layout>
  );
}
