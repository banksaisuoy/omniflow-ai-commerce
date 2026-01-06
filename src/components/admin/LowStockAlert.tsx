import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, Package, ChevronRight, Brain, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface InventoryItem {
  id: string;
  quantity: number;
  low_stock_threshold: number | null;
  product: {
    id: string;
    name: string;
    sku: string | null;
    thumbnail_url: string | null;
  };
}

export function LowStockAlert() {
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);

  useEffect(() => {
    fetchLowStockItems();
  }, []);

  const fetchLowStockItems = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select(`
          id,
          quantity,
          low_stock_threshold,
          product:products(id, name, sku, thumbnail_url)
        `)
        .lt('quantity', 10)
        .order('quantity', { ascending: true })
        .limit(5);

      if (error) throw error;
      
      // Filter and transform data
      const items = (data || []).filter(item => item.product).map(item => ({
        ...item,
        product: item.product as unknown as InventoryItem['product']
      }));
      
      setLowStockItems(items);
    } catch (error) {
      console.error('Error fetching low stock items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAiSuggestions = async () => {
    setIsAnalyzing(true);
    try {
      const { data: salesData } = await supabase
        .from('order_items')
        .select('product_id, quantity, created_at')
        .order('created_at', { ascending: false })
        .limit(100);

      const { data, error } = await supabase.functions.invoke('ai-forecast', {
        body: {
          inventoryData: lowStockItems,
          salesData,
          type: 'inventory_optimization'
        }
      });

      if (error) throw error;
      setAiSuggestions(data);
      toast.success('วิเคราะห์สต็อกสำเร็จ!');
    } catch (error: any) {
      console.error('AI analysis error:', error);
      toast.error(error.message || 'เกิดข้อผิดพลาด');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getStockLevel = (quantity: number, threshold: number | null) => {
    const t = threshold || 10;
    const percentage = (quantity / t) * 100;
    if (percentage <= 25) return { color: 'bg-destructive', text: 'วิกฤต' };
    if (percentage <= 50) return { color: 'bg-warning', text: 'ต่ำ' };
    return { color: 'bg-accent', text: 'ใกล้หมด' };
  };

  if (isLoading) {
    return (
      <Card className="glass border-border/50">
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48 mt-1" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              สินค้าใกล้หมด
            </CardTitle>
            <CardDescription>
              สินค้าที่ต้องเติมสต็อก
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={getAiSuggestions}
            disabled={isAnalyzing || lowStockItems.length === 0}
            className="gap-1"
          >
            {isAnalyzing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Brain className="h-4 w-4" />
            )}
            AI แนะนำ
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {lowStockItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>ไม่มีสินค้าใกล้หมด</p>
          </div>
        ) : (
          <>
            {lowStockItems.map((item) => {
              const stockLevel = getStockLevel(item.quantity, item.low_stock_threshold);
              const threshold = item.low_stock_threshold || 10;
              const percentage = Math.min((item.quantity / threshold) * 100, 100);

              return (
                <div 
                  key={item.id} 
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <div className="w-10 h-10 rounded bg-muted flex items-center justify-center overflow-hidden">
                    {item.product.thumbnail_url ? (
                      <img 
                        src={item.product.thumbnail_url} 
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.product.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={percentage} className="h-2 flex-1" />
                      <span className="text-xs font-medium">{item.quantity}</span>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${stockLevel.color === 'bg-destructive' ? 'border-destructive text-destructive' : stockLevel.color === 'bg-warning' ? 'border-warning text-warning' : 'border-accent text-accent'}`}
                  >
                    {stockLevel.text}
                  </Badge>
                </div>
              );
            })}

            {/* AI Suggestions */}
            {aiSuggestions?.reorderSuggestions && (
              <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                <h4 className="font-semibold text-sm flex items-center gap-2 mb-3">
                  <Brain className="h-4 w-4 text-primary" />
                  AI แนะนำให้สั่งซื้อ
                </h4>
                <div className="space-y-2 text-sm">
                  {aiSuggestions.reorderSuggestions.slice(0, 3).map((suggestion: any, index: number) => (
                    <p key={index} className="text-muted-foreground">
                      • {suggestion.product || suggestion.name}: สั่ง {suggestion.quantity || suggestion.reorderQty} ชิ้น
                    </p>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
