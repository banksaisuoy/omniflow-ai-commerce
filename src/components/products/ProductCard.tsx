import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/stores/cartStore';
import { WishlistButton } from '@/components/products/WishlistButton';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';


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

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

export function ProductCard({ product, viewMode = 'grid' }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      thumbnail_url: product.thumbnail_url,
    });
    toast.success('เพิ่มลงตะกร้าแล้ว');
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
                <span className="font-bold text-primary">฿{product.price.toLocaleString()}</span>
                {product.compare_at_price && (
                  <span className="text-sm text-muted-foreground line-through">
                    ฿{product.compare_at_price.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
            <Button onClick={handleAddToCart}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              เพิ่มลงตะกร้า
            </Button>
          </CardContent>
        </Link>
      </Card>
    );
  }

  return (
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
          {discount && (
            <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground border-0 rounded-full px-3">
              -{discount}%
            </Badge>
          )}
          <WishlistButton productId={product.id} className="absolute top-3 right-3" />
          <div className="absolute inset-x-3 bottom-3 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="icon" className="rounded-full shadow-soft h-9 w-9" onClick={handleAddToCart}>
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
            <span className="font-display text-xl text-primary">฿{product.price.toLocaleString()}</span>
            {product.compare_at_price && (
              <span className="text-sm text-muted-foreground line-through">
                ฿{product.compare_at_price.toLocaleString()}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
