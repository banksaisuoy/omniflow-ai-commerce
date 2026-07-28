import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Eye, Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/stores/cartStore';
import { WishlistButton } from '@/components/products/WishlistButton';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';


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
  const [quickViewQuantity, setQuickViewQuantity] = useState(1);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const handleAddToCart = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    addItem({
      id: product.id,
      name: product.name,
      price: flashSaleData ? flashSaleData.sale_price : product.price,
      thumbnail_url: product.thumbnail_url,
    });
    toast.success('เพิ่มลงตะกร้าแล้ว', {
      action: {
        label: 'ดูตะกร้า',
        onClick: () => navigate('/cart')
      }
    });
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
    setIsQuickViewOpen(false);
    toast.success(`เพิ่ม ${quickViewQuantity} ชิ้น ลงตะกร้าแล้ว`, {
      action: {
        label: 'ดูตะกร้า',
        onClick: () => navigate('/cart')
      }
    });
    setQuickViewQuantity(1);
  };

  const discount = product.compare_at_price
    ? Math.round((1 - product.price / product.compare_at_price) * 100)
    : null;

  if (viewMode === 'list') {
    return (
      <Card className="overflow-hidden hover:border-primary/50 transition-colors relative">
        <div className="flex">
          <Link to={`/product/${product.slug}`} className="flex-shrink-0 w-32 h-32 block">
            <div className="w-full h-full bg-muted">
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
          </Link>
          <CardContent className="flex-1 p-4 flex items-center justify-between">
            <div>
              <Link to={`/product/${product.slug}`}>
                <h3 className="font-semibold mb-1 line-clamp-1 hover:text-primary transition-colors">{product.name}</h3>
              </Link>
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
            <div className="flex flex-col items-end gap-2 z-10">
              <Button onClick={(e) => handleAddToCart(e)} disabled={flashSaleData && flashSaleData.stock_limit > 0 && flashSaleData.sold_count >= flashSaleData.stock_limit}>
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
        </div>
      </Card>
    );
  }

  return (
    <div className="h-full">
      <Card className="h-full flex flex-col overflow-hidden group rounded-3xl border-border/60 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 shadow-soft hover:shadow-elegant">
        <div className="relative aspect-square bg-muted overflow-hidden">
          <Link to={`/product/${product.slug}`} className="absolute inset-0 z-0">
            <span className="sr-only">ดูรายละเอียด {product.name}</span>
          </Link>
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
          <WishlistButton productId={product.id} className="absolute top-3 right-3 z-10" />
          <div className="absolute inset-x-3 bottom-3 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <Dialog open={isQuickViewOpen} onOpenChange={setIsQuickViewOpen}>
              <DialogTrigger asChild>
                <Button size="icon" variant="secondary" className="rounded-full shadow-soft h-10 w-10 bg-white/90 hover:bg-white text-primary">
                  <Eye className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden rounded-2xl">
                <div className="grid md:grid-cols-2">
                  <div className="aspect-square md:aspect-auto bg-muted">
                    {product.thumbnail_url ? (
                      <img src={product.thumbnail_url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col justify-between">
                    <div>
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-display">{product.name}</DialogTitle>
                        {product.category && <Badge variant="outline" className="w-fit mb-2">{product.category}</Badge>}
                      </DialogHeader>
                      <div className="mt-4 mb-4">
                        <span className="text-2xl font-bold text-primary">฿{flashSaleData ? flashSaleData.sale_price.toLocaleString() : product.price.toLocaleString()}</span>
                        {(!flashSaleData && product.compare_at_price) && (
                           <span className="text-sm text-muted-foreground line-through ml-2">฿{product.compare_at_price.toLocaleString()}</span>
                        )}
                        {(flashSaleData) && (
                           <span className="text-sm text-muted-foreground line-through ml-2">฿{product.price.toLocaleString()}</span>
                        )}
                      </div>
                      <DialogDescription className="text-sm text-muted-foreground line-clamp-4">
                        {product.description || "ยังไม่มีรายละเอียดสินค้า"}
                      </DialogDescription>

                      {flashSaleData && flashSaleData.stock_limit > 0 && (
                        <div className="mt-4">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>ขายแล้ว {flashSaleData.sold_count} ชิ้น</span>
                            <span>เหลือ {Math.max(0, flashSaleData.stock_limit - flashSaleData.sold_count)}</span>
                          </div>
                          <Progress value={Math.min(100, (flashSaleData.sold_count / flashSaleData.stock_limit) * 100)} className="h-2" />
                        </div>
                      )}
                    </div>

                    <div className="mt-6 space-y-4">
                      <div className="flex items-center gap-4">
                         <div className="flex items-center border border-border rounded-lg">
                          <Button variant="ghost" size="icon" onClick={() => setQuickViewQuantity(Math.max(1, quickViewQuantity - 1))}>
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-10 text-center font-medium">{quickViewQuantity}</span>
                          <Button variant="ghost" size="icon" onClick={() => setQuickViewQuantity(quickViewQuantity + 1)}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          className="flex-1"
                          onClick={handleQuickViewAddToCart}
                          disabled={flashSaleData && flashSaleData.stock_limit > 0 && flashSaleData.sold_count >= flashSaleData.stock_limit}
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          {flashSaleData && flashSaleData.stock_limit > 0 && flashSaleData.sold_count >= flashSaleData.stock_limit ? 'สินค้าหมด' : 'เพิ่มลงตะกร้า'}
                        </Button>
                        <Button variant="outline" asChild>
                           <Link to={`/product/${product.slug}`}>ดูรายละเอียด</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button size="icon" className="rounded-full shadow-soft h-10 w-10 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={(e) => handleAddToCart(e)} disabled={flashSaleData && flashSaleData.stock_limit > 0 && flashSaleData.sold_count >= flashSaleData.stock_limit}>
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <CardContent className="p-5 flex-1 flex flex-col">
          {product.category && (
            <p className="text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">{product.category}</p>
          )}
          <Link to={`/product/${product.slug}`} className="block relative z-10 hover:text-primary transition-colors">
            <h3 className="font-display text-lg mb-2 line-clamp-2 min-h-[3rem] leading-snug">{product.name}</h3>
          </Link>
          <div className="mt-auto">
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
