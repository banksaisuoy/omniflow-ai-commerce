import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
    setIsQuickViewOpen(true);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/product/${product.slug}`;
    if (navigator.share) {
      await navigator.share({
        title: product.name,
        url: url,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(url);
      toast.success('คัดลอกลิงก์สำเร็จ');
    }
  };

  const discount = product.compare_at_price
    ? Math.round((1 - product.price / product.compare_at_price) * 100)
    : null;
          ) : null}
          <WishlistButton productId={product.id} className="absolute top-3 right-3" />
          <div className="absolute inset-x-3 bottom-3 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="icon" variant="secondary" className="rounded-full shadow-soft h-9 w-9 bg-background/90 hover:bg-background" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="secondary" className="rounded-full shadow-soft h-9 w-9 bg-background/90 hover:bg-background" onClick={handleQuickView}>
              <Eye className="h-4 w-4" />
            </Button>
