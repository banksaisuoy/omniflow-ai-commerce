import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Save, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUploader } from './ImageUploader';
import { AIAnalysisPanel } from './AIAnalysisPanel';
import { useProductUploaderStore } from '@/stores/productUploaderStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function MagicProductUploader() {
  const [isSaving, setIsSaving] = useState(false);
  const {
    imagePreview,
    isAnalyzing,
    aiData,
    editedData,
    setIsAnalyzing,
    setStreamedContent,
    setAIData,
    setAnalysisError,
    reset,
  } = useProductUploaderStore();

  const analyzeImage = async () => {
    if (!imagePreview) return;

    setIsAnalyzing(true);
    setStreamedContent('');
    setAnalysisError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-product`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ imageBase64: imagePreview, stream: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const json = JSON.parse(line.slice(6));
              const content = json.choices?.[0]?.delta?.content;
              if (content) {
                fullContent += content;
                setStreamedContent(fullContent);
              }
            } catch {}
          }
        }
      }

      // Parse the final JSON
      const jsonMatch = fullContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        setAIData(data);
        toast.success('Product analyzed successfully!');
      }
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : 'Analysis failed');
      toast.error('Failed to analyze product');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveProduct = async () => {
    if (!editedData || !imagePreview) return;

    setIsSaving(true);
    try {
      const slug = editedData.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'product';
      
      const { error } = await supabase.from('products').insert({
        name: editedData.name,
        slug: `${slug}-${Date.now()}`,
        description: editedData.description_html?.replace(/<[^>]*>/g, ''),
        description_html: editedData.description_html,
        price: editedData.price_range?.suggested || 0,
        category: editedData.category,
        subcategory: editedData.subcategory,
        tags: editedData.tags,
        images: [imagePreview],
        thumbnail_url: imagePreview,
        seo_title: editedData.seo_title,
        seo_description: editedData.seo_description,
        ai_generated_data: editedData,
        status: 'draft',
      });

      if (error) throw error;

      toast.success('Product saved as draft!');
      reset();
    } catch (error) {
      toast.error('Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-primary/20 bg-gradient-to-br from-card to-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Sparkles className="h-6 w-6 text-primary" />
              Magic Product Uploader
            </CardTitle>
            <CardDescription>
              Upload a product image and let AI generate name, description, pricing, and tags automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ImageUploader />
            
            {imagePreview && !aiData && !isAnalyzing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center">
                <Button onClick={analyzeImage} size="lg" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Analyze with AI
                </Button>
              </motion.div>
            )}

            <AIAnalysisPanel />

            {aiData && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-end gap-3">
                <Button variant="outline" onClick={reset} className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Start Over
                </Button>
                <Button onClick={saveProduct} disabled={isSaving} className="gap-2">
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Saving...' : 'Save Product'}
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
