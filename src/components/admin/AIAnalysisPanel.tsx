import DOMPurify from 'dompurify';
import { motion } from 'framer-motion';
import { Sparkles, Check, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useProductUploaderStore } from '@/stores/productUploaderStore';

export function AIAnalysisPanel() {
  const { 
    isAnalyzing, 
    streamedContent, 
    aiData, 
    analysisError,
    editedData,
    updateEditedField,
  } = useProductUploaderStore();

  if (analysisError) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>{analysisError}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isAnalyzing) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
              <Sparkles className="h-5 w-5 text-primary" />
            </motion.div>
            AI Analysis in Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm min-h-[200px] max-h-[400px] overflow-auto">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="whitespace-pre-wrap"
            >
              {streamedContent || "Initializing analysis..."}
            </motion.span>
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="inline-block w-2 h-4 bg-primary ml-1"
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!aiData || !editedData) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Check className="h-5 w-5 text-success" />
            AI Analysis Complete
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div>
              <Label>Product Name</Label>
              <Input
                value={editedData.name || ''}
                onChange={(e) => updateEditedField('name', e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Input
                  value={editedData.category || ''}
                  onChange={(e) => updateEditedField('category', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Subcategory</Label>
                <Input
                  value={editedData.subcategory || ''}
                  onChange={(e) => updateEditedField('subcategory', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label>Suggested Price</Label>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={editedData.price_range?.suggested || 0}
                  onChange={(e) => updateEditedField('price_range', {
                    ...editedData.price_range!,
                    suggested: parseFloat(e.target.value)
                  })}
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  (Range: ${editedData.price_range?.min} - ${editedData.price_range?.max})
                </span>
              </div>
            </div>

            <div>
              <Label>Colors</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {editedData.colors?.map((color, i) => (
                  <Badge key={i} variant="secondary">{color}</Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {editedData.tags?.map((tag, i) => (
                  <Badge key={i} variant="outline">{tag}</Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>AI-Generated Description</Label>
              <div 
                className="mt-1 p-3 bg-muted/50 rounded-lg text-sm prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: editedData.description_html || '' }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
