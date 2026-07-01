import { Heart } from 'lucide-react';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function WishlistButton({ productId, className }: { productId: string; className?: string }) {
  const { user } = useAuth();
  const { productIds, toggle, isToggling } = useWishlist();
  const navigate = useNavigate();
  const active = productIds.has(productId);

  return (
    <button
      onClick={(e) => {
        e.preventDefault(); e.stopPropagation();
        if (!user) return navigate('/auth');
        toggle(productId);
      }}
      disabled={isToggling}
      aria-label="เพิ่มเข้ารายการโปรด"
      className={cn('h-9 w-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-soft hover:scale-110 transition', className)}
    >
      <Heart className={cn('h-4 w-4 transition', active ? 'fill-primary text-primary' : 'text-muted-foreground')} />
    </button>
  );
}
