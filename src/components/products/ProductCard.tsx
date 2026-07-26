import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Eye, Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
  const navigate = useNavigate();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [quickViewQuantity, setQuickViewQuantity] = useState(1);

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

  const handleQuickViewAddToCart = () => {
    for (let i = 0; i < quickViewQuantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: flashSaleData ? flashSaleData.sale_price : product.price,
        thumbnail_url: product.thumbnail_url,
      });
    }
    toast.success('เพิ่มลงตะกร้าแล้ว');
    setIsQuickViewOpen(false);
  };

  const discount = product.compare_at_price
    ? Math.round((1 - product.price / product.compare_at_price) * 100)
    : null;

  if (viewMode === 'list') {
    return (
      <>
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
      </>
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
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full shadow-soft h-9 w-9 bg-background/90 hover:bg-background"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsQuickViewOpen(true);
              }}
            >
              <Eye className="h-4 w-4 text-foreground" />
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

      <Dialog open={isQuickViewOpen} onOpenChange={(open) => {
        setIsQuickViewOpen(open);
        if (!open) setQuickViewQuantity(1);
      }}>
        <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden">
          <div className="grid sm:grid-cols-2 gap-0">
            <div className="relative aspect-square sm:aspect-auto bg-muted">
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
              {discount && (
                <Badge className="absolute top-4 left-4 bg-destructive text-sm px-2 py-0.5">
                  -{discount}%
                </Badge>
              )}
            </div>
            <div className="p-6 sm:p-8 flex flex-col">
              <DialogHeader className="mb-4 text-left">
                {product.category && (
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">{product.category}</p>
                )}
                <DialogTitle className="text-2xl font-display leading-tight">{product.name}</DialogTitle>
                <div className="flex items-baseline gap-2 mt-2">
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
              </DialogHeader>

              <div className="flex-1 overflow-y-auto pr-2 mb-6 text-sm text-muted-foreground">
                <DialogDescription>
                  {product.description || "ไม่มีรายละเอียดสินค้า"}
                </DialogDescription>
              </div>

              <div className="mt-auto space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-border rounded-lg">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10"
                      onClick={() => setQuickViewQuantity(Math.max(1, quickViewQuantity - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">{quickViewQuantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10"
                      onClick={() => setQuickViewQuantity(quickViewQuantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    className="flex-1 h-10"
                    onClick={handleQuickViewAddToCart}
                    disabled={flashSaleData && flashSaleData.stock_limit > 0 && flashSaleData.sold_count >= flashSaleData.stock_limit}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    เพิ่มลงตะกร้า
                  </Button>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setIsQuickViewOpen(false);
                    navigate(`/product/${product.slug}`);
                  }}
                >
                  ดูรายละเอียดเต็ม
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
