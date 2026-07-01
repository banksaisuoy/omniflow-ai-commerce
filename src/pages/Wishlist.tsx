import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useWishlist } from '@/hooks/useWishlist';
import { Navigate, Link } from 'react-router-dom';
import { ProductCard } from '@/components/products/ProductCard';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell } from 'lucide-react';

export default function Wishlist() {
  const { user, loading } = useAuth();
  const { items, isLoading, updateSettings } = useWishlist();

  if (!loading && !user) return <Navigate to="/auth" replace />;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="h-8 w-8 text-primary fill-primary" />
          <h1 className="font-display text-4xl">รายการโปรด</h1>
        </div>

        {isLoading ? (
          <p className="text-center py-10">กำลังโหลด...</p>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground mb-4">ยังไม่มีรายการโปรด</p>
            <Button asChild><Link to="/products">ไปเลือกซื้อขนม</Link></Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((it: any) => it.product && (
              <div key={it.id} className="flex flex-col gap-3">
                <ProductCard product={it.product} />
                <div className="flex items-center justify-between px-2 bg-muted/30 p-2 rounded-xl border">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor={`notify-${it.id}`} className="text-xs cursor-pointer text-muted-foreground">แจ้งเตือนราคาลด</Label>
                  </div>
                  <Switch
                    id={`notify-${it.id}`}
                    checked={!!it.notify_on_price_drop}
                    onCheckedChange={(checked) => updateSettings({ productId: it.product_id, notify_on_price_drop: checked })}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
