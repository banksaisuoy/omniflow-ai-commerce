import { useState } from 'react';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';

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

interface QuickViewModalProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickViewModal({ product, open, onOpenChange }: QuickViewModalProps) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        thumbnail_url: product.thumbnail_url,
      });
    }
    toast.success(`เพิ่ม ${quantity} ชิ้น ลงตะกร้าแล้ว`);
    onOpenChange(false);
    // Reset quantity after a short delay to allow closing animation
    setTimeout(() => setQuantity(1), 300);
  };

  const discount = product.compare_at_price
    ? Math.round((1 - product.price / product.compare_at_price) * 100)
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl overflow-hidden p-0 sm:rounded-2xl">
        <div className="grid md:grid-cols-2">
          {/* Product Image */}
          <div className="relative aspect-square md:aspect-auto md:h-full bg-muted">
            {product.thumbnail_url ? (
              <img
                src={product.thumbnail_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-gradient-warm">
                No Image
              </div>
            )}
            {discount && (
              <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground border-0 px-3 py-1 text-sm font-medium">
                -{discount}%
              </Badge>
            )}
          </div>

          {/* Product Details */}
          <div className="p-6 md:p-8 flex flex-col justify-center">
            <DialogHeader className="text-left mb-6 space-y-2">
              {product.category && (
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                  {product.category}
                </span>
              )}
              <DialogTitle className="text-2xl md:text-3xl font-display leading-tight">
                {product.name}
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground line-clamp-3 mt-2">
                {product.description || 'ไม่มีรายละเอียดสินค้า'}
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-baseline gap-3 mb-8">
              <span className="text-3xl font-bold text-primary">
                ฿{product.price.toLocaleString()}
              </span>
              {product.compare_at_price && (
                <span className="text-xl text-muted-foreground line-through">
                  ฿{product.compare_at_price.toLocaleString()}
                </span>
              )}
            </div>

            {/* Quantity and Add to Cart */}
            <div className="flex items-center gap-4 mt-auto">
              <div className="flex items-center border border-border rounded-lg h-12 bg-background">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-full px-3 rounded-l-lg hover:bg-muted"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-full px-3 rounded-r-lg hover:bg-muted"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button size="lg" className="flex-1 h-12 text-base shadow-soft" onClick={handleAddToCart}>
                <ShoppingCart className="mr-2 h-5 w-5" />
                เพิ่มลงตะกร้า
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
