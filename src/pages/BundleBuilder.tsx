import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Package } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';

export default function BundleBuilder() {
  const addItem = useCartStore((state) => state.addItem);

  const { data: bundles, isLoading } = useQuery({
    queryKey: ['bundles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bundles')
        .select('*, items:bundle_items(*, product:products(*))')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleAddBundleToCart = (bundle: any) => {
    addItem({
      id: bundle.id,
      name: `เซ็ต ${bundle.name}`,
      price: bundle.bundle_price,
      thumbnail_url: bundle.image_url || null,
      isBundle: true,
    });
    toast.success(`เพิ่มเซ็ต ${bundle.name} ลงตะกร้าแล้ว`);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        <div className="text-center mb-12">
          <Package className="h-12 w-12 mx-auto text-primary mb-4" />
          <h1 className="font-display text-4xl md:text-5xl mb-4">จัดเซ็ตของขวัญ</h1>
          <p className="text-muted-foreground text-lg">คุ้มค่ากว่าเมื่อซื้อเป็นเซ็ต เหมาะสำหรับเป็นของฝากหรือจัดเบรก</p>
        </div>

        {isLoading ? (
          <div className="text-center py-20">กำลังโหลด...</div>
        ) : bundles && bundles.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bundles.map((bundle: any) => {
              const regularPrice = bundle.items.reduce((sum: number, item: any) => sum + ((item.product?.price || 0) * item.quantity), 0);
              const discount = regularPrice > 0 ? Math.round((1 - bundle.bundle_price / regularPrice) * 100) : 0;

              return (
                <Card key={bundle.id} className="overflow-hidden flex flex-col group hover:border-primary/50 transition-colors">
                  <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                    {bundle.image_url ? (
                      <img src={bundle.image_url} alt={bundle.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-gradient-warm">
                        <Package className="h-10 w-10 opacity-20" />
                      </div>
                    )}
                    {discount > 0 && (
                      <Badge className="absolute top-3 right-3 bg-destructive">ประหยัด {discount}%</Badge>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="font-display text-2xl">{bundle.name}</CardTitle>
                    {bundle.description && <CardDescription>{bundle.description}</CardDescription>}
                  </CardHeader>
                  <CardContent className="flex-1">
                    <h4 className="text-sm font-semibold mb-3 border-b pb-2">ในเซ็ตประกอบด้วย:</h4>
                    <ul className="space-y-2">
                      {bundle.items.map((item: any) => (
                        <li key={item.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{item.product?.name}</span>
                          <span className="font-medium">x{item.quantity}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between bg-muted/30 pt-4 border-t">
                    <div className="flex flex-col">
                      <span className="font-display text-2xl text-primary">฿{bundle.bundle_price.toLocaleString()}</span>
                      {regularPrice > bundle.bundle_price && (
                        <span className="text-xs text-muted-foreground line-through">ปกติ ฿{regularPrice.toLocaleString()}</span>
                      )}
                    </div>
                    <Button onClick={() => handleAddBundleToCart(bundle)}>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      เพิ่มลงตะกร้า
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-muted/30 rounded-3xl">
            <Package className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="font-display text-2xl text-muted-foreground">ยังไม่มีเซ็ตสินค้าในขณะนี้</h3>
          </div>
        )}
      </div>
    </Layout>
  );
}
