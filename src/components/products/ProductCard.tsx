import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useCartStore } from '@/stores/cartStore';
import { WishlistButton } from '@/components/products/WishlistButton';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';


interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  thumbnail_url: string | null;
  category: string | null;
  slug: string;
}

export interface FlashSaleItemData {
  sale_price: number;
  stock_limit: number;
  sold_count: number;
}

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
  flashSaleData?: FlashSaleItemData;
}

export function ProductCard({ product, viewMode = 'grid', flashSaleData }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: flashSaleData ? flashSaleData.sale_price : product.price,
      thumbnail_url: product.thumbnail_url,
    });
    toast.success('เพิ่มลงตะกร้าแล้ว');
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickViewOpen(true);
  };

  const discount = product.compare_at_price
    ? Math.round((1 - product.price / product.compare_at_price) * 100)
    : null;

  if (viewMode === 'list') {
    return (
      <Card className="overflow-hidden hover:border-primary/50 transition-colors">
        <Link to={`/product/${product.slug}`} className="flex">
          <div className="w-32 h-32 flex-shrink-0 bg-muted">
            {product.thumbnail_url ? (
              <img
                src={product.thumbnail_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No Image
              </div>
            )}
          </div>
          <CardContent className="flex-1 p-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-1 line-clamp-1">{product.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                {product.description}
              </p>
              <div className="flex items-center gap-2">
                {flashSaleData ? (
                  <>
                    <span className="font-bold text-destructive">฿{flashSaleData.sale_price.toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground line-through">
                      ฿{product.price.toLocaleString()}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="font-bold text-primary">฿{product.price.toLocaleString()}</span>
                    {product.compare_at_price && (
                      <span className="text-sm text-muted-foreground line-through">
                        ฿{product.compare_at_price.toLocaleString()}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Button onClick={handleAddToCart} disabled={flashSaleData && flashSaleData.stock_limit > 0 && flashSaleData.sold_count >= flashSaleData.stock_limit}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                {flashSaleData && flashSaleData.stock_limit > 0 && flashSaleData.sold_count >= flashSaleData.stock_limit ? 'สินค้าหมด' : 'เพิ่มลงตะกร้า'}
              </Button>
              {flashSaleData && flashSaleData.stock_limit > 0 && (
                <div className="w-full max-w-[120px] text-right">
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                    <span>ขายแล้ว {flashSaleData.sold_count}</span>
                  </div>
                  <Progress value={Math.min(100, (flashSaleData.sold_count / flashSaleData.stock_limit) * 100)} className="h-1.5" />
                </div>
              )}
            </div>
          </CardContent>
        </Link>
      </Card>
    );
  }

  return (
    <>
    <Link to={`/product/${product.slug}`}>
      <Card className="overflow-hidden group rounded-3xl border-border/60 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 shadow-soft hover:shadow-elegant">
        <div className="relative aspect-square bg-muted overflow-hidden">
          {product.thumbnail_url ? (
            <img
              src={product.thumbnail_url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-gradient-warm">
              No Image
            </div>
          )}
          {flashSaleData ? (
            <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground border-0 rounded-full px-3 animate-pulse">
              Flash Sale
            </Badge>
          ) : discount ? (
            <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground border-0 rounded-full px-3">
              -{discount}%
            </Badge>
          ) : null}
          <WishlistButton productId={product.id} className="absolute top-3 right-3" />
          <div className="absolute inset-x-3 bottom-3 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="icon" variant="secondary" className="rounded-full shadow-soft h-9 w-9 bg-background/90 hover:bg-background" onClick={handleQuickView}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button size="icon" className="rounded-full shadow-soft h-9 w-9" onClick={handleAddToCart} disabled={flashSaleData && flashSaleData.stock_limit > 0 && flashSaleData.sold_count >= flashSaleData.stock_limit}>
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <CardContent className="p-5">
          {product.category && (
            <p className="text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">{product.category}</p>
          )}
          <h3 className="font-display text-lg mb-2 line-clamp-2 min-h-[3rem] leading-snug">{product.name}</h3>
          <div className="flex items-baseline gap-2">
            {flashSaleData ? (
              <>
                <span className="font-display text-xl text-destructive">฿{flashSaleData.sale_price.toLocaleString()}</span>
                <span className="text-sm text-muted-foreground line-through">
                  ฿{product.price.toLocaleString()}
                </span>
              </>
            ) : (
              <>
                <span className="font-display text-xl text-primary">฿{product.price.toLocaleString()}</span>
                {product.compare_at_price && (
                  <span className="text-sm text-muted-foreground line-through">
                    ฿{product.compare_at_price.toLocaleString()}
                  </span>
                )}
              </>
            )}
          </div>
          {flashSaleData && flashSaleData.stock_limit > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>ขายแล้ว {flashSaleData.sold_count} ชิ้น</span>
                <span>เหลือ {Math.max(0, flashSaleData.stock_limit - flashSaleData.sold_count)}</span>
              </div>
              <Progress value={Math.min(100, (flashSaleData.sold_count / flashSaleData.stock_limit) * 100)} className="h-1.5" />
            </div>
          )}
        </CardContent>
      </Card>
    </Link>

    <Dialog open={isQuickViewOpen} onOpenChange={setIsQuickViewOpen}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="grid md:grid-cols-2">
          <div className="relative aspect-square md:aspect-auto bg-muted">
            {product.thumbnail_url ? (
              <img src={product.thumbnail_url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-gradient-warm">
                No Image
              </div>
            )}
          </div>
          <div className="p-6 md:p-8 flex flex-col justify-center">
            <DialogTitle className="font-display text-2xl mb-2">{product.name}</DialogTitle>
            <DialogDescription className="text-muted-foreground mb-4 line-clamp-3">
              {product.description || 'ไม่มีรายละเอียดสินค้า'}
            </DialogDescription>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="font-display text-2xl text-primary">฿{flashSaleData ? flashSaleData.sale_price.toLocaleString() : product.price.toLocaleString()}</span>
              {(product.compare_at_price || flashSaleData) && (
                <span className="text-sm text-muted-foreground line-through">
                  ฿{product.price.toLocaleString()}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-3">
              <Button size="lg" className="w-full" onClick={(e) => {
                handleAddToCart(e);
                setIsQuickViewOpen(false);
              }} disabled={flashSaleData && flashSaleData.stock_limit > 0 && flashSaleData.sold_count >= flashSaleData.stock_limit}>
                <ShoppingCart className="h-5 w-5 mr-2" />
                {flashSaleData && flashSaleData.stock_limit > 0 && flashSaleData.sold_count >= flashSaleData.stock_limit ? 'สินค้าหมด' : 'เพิ่มลงตะกร้า'}
              </Button>
              <Button size="lg" variant="outline" className="w-full" asChild onClick={() => setIsQuickViewOpen(false)}>
                <Link to={`/product/${product.slug}`}>ดูรายละเอียดเต็ม</Link>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}