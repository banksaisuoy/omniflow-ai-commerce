import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, Share2, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import DOMPurify from 'dompurify';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

export default function BlogPost() {
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    const updateScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        setReadingProgress(Math.min(100, Math.max(0, (currentScrollY / scrollHeight) * 100)));
      }
    };
    window.addEventListener('scroll', updateScroll, { passive: true });
    return () => window.removeEventListener('scroll', updateScroll);
  }, []);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('ลิงก์ถูกคัดลอกเรียบร้อยแล้ว'); // Link copied
    } catch (err) {
      toast.error('ไม่สามารถคัดลอกลิงก์ได้');
    }
  };
  const calculateReadingTime = (text: string | null | undefined) => {
    if (!text) return 0;
    const strippedText = text.replace(/<[^>]*>?/gm, '');
    const cleanText = strippedText.trim();
    if (!cleanText) return 0;

    const wordsPerMinute = 200;
    const words = cleanText.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  };
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
      {/* Reading Progress Bar */}
      <div
        className="fixed top-0 left-0 h-1 bg-primary z-50 transition-all duration-150 ease-out"
        style={{ width: `${readingProgress}%` }}
      />
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
            <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {post.published_at
                    ? new Date(post.published_at).toLocaleDateString('th-TH', {
                        year: 'numeric', month: 'long', day: 'numeric',
                      })
                    : ''}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {calculateReadingTime(post.content)} นาทีในการอ่าน
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                แชร์บทความ
              </Button>
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
